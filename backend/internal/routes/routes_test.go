package routes

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"
	"github.com/gin-gonic/gin"
)

func TestUserJourneyAndIsolation(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("DATABASE_URL", os.Getenv("TEST_DATABASE_URL"))
	t.Setenv("SQLITE_PATH", filepath.Join(t.TempDir(), "test.db"))
	if err := database.Connect(); err != nil {
		t.Fatal(err)
	}
	r := gin.New()
	RegisterRoutes(r)
	call := func(method, path, token string, body any, status int) map[string]any {
		t.Helper()
		data, _ := json.Marshal(body)
		req := httptest.NewRequest(method, path, bytes.NewReader(data))
		req.Header.Set("Content-Type", "application/json")
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		if w.Code != status {
			t.Fatalf("%s %s: got %d want %d: %s", method, path, w.Code, status, w.Body.String())
		}
		out := map[string]any{}
		if w.Body.Len() > 0 {
			if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil {
				t.Fatal(err)
			}
		}
		return out
	}
	register := func(email string) string {
		return call("POST", "/api/users", "", map[string]string{"username": "テスト", "email": email, "password": "password123"}, 200)["token"].(string)
	}
	firstEmail := fmt.Sprintf("first-%d@example.com", time.Now().UnixNano())
	secondEmail := fmt.Sprintf("second-%d@example.com", time.Now().UnixNano())
	a := register(firstEmail)
	b := register(secondEmail)
	call("POST", "/api/users/login", "", map[string]string{"email": firstEmail, "password": "wrong"}, 401)
	call("POST", "/api/users/login", "", map[string]string{"email": "missing@example.com", "password": "wrong"}, 401)
	call("POST", "/api/users", "", map[string]string{"username": "重複", "email": strings.ToUpper(firstEmail), "password": "password123"}, 409)
	login := call("POST", "/api/users/login", "", map[string]string{"email": firstEmail, "password": "password123"}, 200)
	if _, ok := login["user"].(map[string]any)["password"]; ok {
		t.Fatal("password exposed")
	}
	var user model.User
	database.DB.Where("email = ?", firstEmail).First(&user)
	if user.Password == "password123" {
		t.Fatal("plaintext password stored")
	}
	call("GET", "/api/companies", "", nil, 401)
	company := call("POST", "/api/companies", a, map[string]string{"company_name": "株式会社サポ", "industry": "IT", "memo": "面接準備", "status": "applying"}, 200)["company"].(map[string]any)
	id := fmt.Sprintf("%.0f", company["id"])
	call("PUT", "/api/companies/"+id, b, map[string]string{"company_name": "盗用", "status": "offer"}, 404)
	call("DELETE", "/api/companies/"+id, b, nil, 404)
	if len(call("GET", "/api/companies", b, nil, 200)["companies"].([]any)) != 0 {
		t.Fatal("company leaked")
	}
	call("PUT", "/api/companies/"+id, a, map[string]string{"company_name": "サポ", "industry": "", "memo": "", "status": "offer"}, 200)
	list := call("GET", "/api/companies", a, nil, 200)["companies"].([]any)
	if list[0].(map[string]any)["memo"] != "" {
		t.Fatal("cannot clear memo")
	}
	call("POST", "/api/companies", a, map[string]string{"company_name": "bad", "status": "unknown"}, 400)
	tasks := call("GET", "/api/tasks", a, nil, 200)["tasks"].([]any)
	taskID := fmt.Sprintf("%.0f", tasks[0].(map[string]any)["id"])
	call("POST", "/api/tasks/"+taskID+"/complete", b, nil, 404)
	for range 2 {
		call("POST", "/api/tasks/"+taskID+"/complete", a, nil, 200)
	}
	ch := call("GET", "/api/characters", a, nil, 200)["character"].(map[string]any)
	if ch["exp"] != float64(25) {
		t.Fatalf("duplicate reward: %v", ch)
	}
	for i := 0; i < 3; i++ {
		task := call("POST", "/api/tasks", a, map[string]string{"title": "追加ミッション"}, 201)["task"].(map[string]any)
		call("POST", fmt.Sprintf("/api/tasks/%.0f/complete", task["id"]), a, nil, 200)
	}
	ch = call("GET", "/api/characters", a, nil, 200)["character"].(map[string]any)
	if ch["level"] != float64(2) || ch["exp"] != float64(0) {
		t.Fatalf("level-up failed: %v", ch)
	}
	schedule := call("POST", "/api/schedules", a, map[string]string{"title": "面接", "schedule_at": "2026-12-01T09:00:00+09:00", "memo": "履歴書"}, 200)["schedule"].(map[string]any)
	sid := fmt.Sprintf("%.0f", schedule["id"])
	call("DELETE", "/api/schedules/"+sid, b, nil, 404)
	call("PUT", "/api/schedules/"+sid, a, map[string]string{"title": "面接変更", "schedule_at": "2026-12-02T10:00:00+09:00", "memo": ""}, 200)
	call("DELETE", "/api/schedules/"+sid, a, nil, 204)
	// Closing and reopening the connection must preserve persisted records.
	sqlDB, err := database.DB.DB()
	if err != nil {
		t.Fatal(err)
	}
	if err := sqlDB.Close(); err != nil {
		t.Fatal(err)
	}
	if err := database.Connect(); err != nil {
		t.Fatal(err)
	}
	persisted := call("GET", "/api/characters", a, nil, 200)["character"].(map[string]any)
	if persisted["level"] != float64(2) {
		t.Fatal("character did not persist")
	}
	if len(call("GET", "/api/companies", a, nil, 200)["companies"].([]any)) != 1 {
		t.Fatal("company did not persist")
	}
	call("DELETE", "/api/companies/bad-id", a, nil, 400)
	database.DB.Model(&model.Session{}).Where("token = ?", digest(b)).Update("expires_at", time.Now().Add(-time.Hour))
	call("GET", "/api/me", b, nil, 401)
	call("DELETE", "/api/companies/"+id, a, nil, 204)
	call("POST", "/api/logout", a, nil, 204)
	call("GET", "/api/me", a, nil, 401)
}
