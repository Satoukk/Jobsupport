package routes

import (
	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
)

func fail(c *gin.Context, status int, message string) {
	c.AbortWithStatusJSON(status, gin.H{"error": message})
}
func uid(c *gin.Context) uint { return c.MustGet("userID").(uint) }
func digest(s string) string  { h := sha256.Sum256([]byte(s)); return hex.EncodeToString(h[:]) }
func auth(c *gin.Context) {
	if !strings.HasPrefix(c.GetHeader("Authorization"), "Bearer ") {
		fail(c, 401, "ログインしてください")
		return
	}
	token := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
	var session model.Session
	if len(token) != 64 || database.DB.Where("token = ? AND expires_at > ?", digest(token), time.Now()).First(&session).Error != nil {
		fail(c, 401, "ログインしてください")
		return
	}
	c.Set("userID", session.UserID)
	c.Next()
}
func sessionResponse(c *gin.Context, user model.User) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		fail(c, 500, "ログインに失敗しました")
		return
	}
	token := hex.EncodeToString(b)
	database.DB.Where("expires_at <= ?", time.Now()).Delete(&model.Session{})
	session := model.Session{Token: digest(token), UserID: user.ID, ExpiresAt: time.Now().Add(7 * 24 * time.Hour)}
	if database.DB.Create(&session).Error != nil {
		fail(c, 500, "ログインに失敗しました")
		return
	}
	c.JSON(200, gin.H{"user": user, "token": token})
}
func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	api.Use(func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 64<<10)
		c.Header("Cache-Control", "no-store")
		c.Next()
	})
	limiter := newAuthLimiter()
	api.Use(func(c *gin.Context) {
		if c.Request.Method == "POST" && (c.FullPath() == "/api/users" || c.FullPath() == "/api/users/login") {
			if !limiter.allow(c.ClientIP()) {
				c.Header("Retry-After", "60")
				fail(c, 429, "試行回数が多すぎます。1分後にもう一度お試しください")
				return
			}
		}
		c.Next()
	})
	api.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"message": "JOBサポ API"}) })
	api.POST("/users", register)
	api.POST("/users/login", login)
	secured := api.Group("")
	secured.Use(auth)
	secured.GET("/me", func(c *gin.Context) {
		var u model.User
		if database.DB.First(&u, uid(c)).Error != nil {
			fail(c, 401, "ユーザーが見つかりません")
			return
		}
		c.JSON(200, gin.H{"user": u})
	})
	secured.POST("/logout", func(c *gin.Context) {
		if database.DB.Delete(&model.Session{}, "token = ?", digest(strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer "))).Error != nil {
			fail(c, 500, "ログアウトできませんでした。もう一度お試しください")
			return
		}
		c.Status(204)
	})
	secured.GET("/characters", func(c *gin.Context) {
		var ch model.Character
		if database.DB.Where("user_id = ?", uid(c)).First(&ch).Error != nil {
			fail(c, 404, "キャラクターが見つかりません")
			return
		}
		c.JSON(200, gin.H{"character": ch})
	})
	secured.PUT("/characters", func(c *gin.Context) {
		var req struct {
			Name string `json:"name"`
		}
		if c.ShouldBindJSON(&req) != nil || strings.TrimSpace(req.Name) == "" || utf8.RuneCountInString(req.Name) > 30 {
			fail(c, 400, "名前は1〜30文字で入力してください")
			return
		}
		if database.DB.Model(&model.Character{}).Where("user_id = ?", uid(c)).Update("name", strings.TrimSpace(req.Name)).Error != nil {
			fail(c, 500, "保存できませんでした")
			return
		}
		c.JSON(200, gin.H{"ok": true})
	})
	secured.GET("/companies", companies)
	secured.POST("/companies", saveCompany)
	secured.PUT("/companies/:id", saveCompany)
	secured.DELETE("/companies/:id", func(c *gin.Context) { remove(c, &model.Company{}) })
	secured.GET("/tasks", func(c *gin.Context) {
		tasks := []model.Task{}
		if database.DB.Where("user_id = ?", uid(c)).Order("id DESC").Find(&tasks).Error != nil {
			fail(c, 500, "取得できませんでした")
			return
		}
		c.JSON(200, gin.H{"tasks": tasks})
	})
	secured.POST("/tasks", func(c *gin.Context) {
		var req struct {
			Title string `json:"title"`
		}
		if c.ShouldBindJSON(&req) != nil || strings.TrimSpace(req.Title) == "" || utf8.RuneCountInString(req.Title) > 120 {
			fail(c, 400, "ミッションを1〜120文字で入力してください")
			return
		}
		t := model.Task{UserID: uid(c), Title: strings.TrimSpace(req.Title)}
		if database.DB.Create(&t).Error != nil {
			fail(c, 500, "登録できませんでした")
			return
		}
		c.JSON(201, gin.H{"task": t})
	})
	secured.POST("/tasks/:id/complete", completeTask)
	secured.DELETE("/tasks/:id", func(c *gin.Context) { remove(c, &model.Task{}) })
	secured.GET("/schedules", func(c *gin.Context) {
		items := []model.Schedule{}
		if database.DB.Where("user_id = ?", uid(c)).Order("schedule_at ASC").Find(&items).Error != nil {
			fail(c, 500, "取得できませんでした")
			return
		}
		c.JSON(200, gin.H{"schedules": items})
	})
	secured.POST("/schedules", saveSchedule)
	secured.PUT("/schedules/:id", saveSchedule)
	secured.DELETE("/schedules/:id", func(c *gin.Context) { remove(c, &model.Schedule{}) })
}
func register(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if c.ShouldBindJSON(&req) != nil {
		fail(c, 400, "入力内容を確認してください")
		return
	}
	req.Username = strings.TrimSpace(req.Username)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	address, err := mail.ParseAddress(req.Email)
	if err != nil || address.Address != req.Email || len(req.Email) > 254 || utf8.RuneCountInString(req.Username) < 1 || utf8.RuneCountInString(req.Username) > 50 || utf8.RuneCountInString(req.Password) < 8 || len(req.Password) > 72 {
		fail(c, 400, "名前・メールと8文字以上72バイト以下のパスワードを入力してください")
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		fail(c, 500, "登録できませんでした")
		return
	}
	user := model.User{Username: req.Username, Email: req.Email, Password: string(hash)}
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		if err := tx.Create(&model.Character{UserID: user.ID, Name: "サポ", Level: 1}).Error; err != nil {
			return err
		}
		for _, title := range []string{"気になる企業を1社調べよう", "自己紹介を3行書いてみよう", "今日はゆっくり休憩しよう"} {
			if err := tx.Create(&model.Task{UserID: user.ID, Title: title}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		fail(c, 409, "このメールアドレスは登録済みか、登録できませんでした")
		return
	}
	sessionResponse(c, user)
}
func login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if c.ShouldBindJSON(&req) != nil {
		fail(c, 400, "入力内容を確認してください")
		return
	}
	var user model.User
	err := database.DB.Where("email = ?", strings.ToLower(strings.TrimSpace(req.Email))).First(&user).Error
	hash := user.Password
	if err != nil {
		hash = "$2a$10$7EqJtq98hPqEX7fNZaFWoO5HVHGWzDlc7OVePqPqXGTc6HbdP4dga"
	}
	passwordErr := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password))
	if err != nil || passwordErr != nil {
		fail(c, 401, "メールアドレスまたはパスワードが違います")
		return
	}
	sessionResponse(c, user)
}
func companies(c *gin.Context) {
	items := []model.Company{}
	q := database.DB.Where("user_id = ?", uid(c))
	if name := c.Query("q"); name != "" {
		q = q.Where("LOWER(company_name || ' ' || industry || ' ' || memo) LIKE ?", "%"+strings.ToLower(name)+"%")
	}
	if q.Order("id DESC").Find(&items).Error != nil {
		fail(c, 500, "取得できませんでした")
		return
	}
	c.JSON(200, gin.H{"companies": items})
}
func saveCompany(c *gin.Context) {
	var req struct {
		CompanyName string `json:"company_name"`
		Industry    string `json:"industry"`
		Memo        string `json:"memo"`
		Status      string `json:"status"`
	}
	if c.ShouldBindJSON(&req) != nil || strings.TrimSpace(req.CompanyName) == "" || utf8.RuneCountInString(req.CompanyName) > 120 || len(req.Memo) > 12000 || len(req.Industry) > 300 {
		fail(c, 400, "企業名は1〜120文字で入力してください")
		return
	}
	if req.Status != "interested" && req.Status != "applying" && req.Status != "offer" && req.Status != "closed" {
		fail(c, 400, "選考状況を選んでください")
		return
	}
	item := model.Company{UserID: uid(c)}
	if c.Param("id") != "" {
		if !owned(c, &item) {
			return
		}
	}
	item.CompanyName = strings.TrimSpace(req.CompanyName)
	item.Industry = req.Industry
	item.Memo = req.Memo
	item.Status = req.Status
	if database.DB.Save(&item).Error != nil {
		fail(c, 500, "保存できませんでした")
		return
	}
	c.JSON(200, gin.H{"company": item})
}
func owned(c *gin.Context, item interface{}) bool {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		fail(c, 400, "IDが正しくありません")
		return false
	}
	if database.DB.Where("id = ? AND user_id = ?", id, uid(c)).First(item).Error != nil {
		fail(c, 404, "データが見つかりません")
		return false
	}
	return true
}
func remove(c *gin.Context, item interface{}) {
	if !owned(c, item) {
		return
	}
	if database.DB.Delete(item).Error != nil {
		fail(c, 500, "削除できませんでした")
		return
	}
	c.Status(204)
}
func saveSchedule(c *gin.Context) {
	var req struct {
		Title      string    `json:"title"`
		ScheduleAt time.Time `json:"schedule_at"`
		Memo       string    `json:"memo"`
	}
	if c.ShouldBindJSON(&req) != nil || strings.TrimSpace(req.Title) == "" || utf8.RuneCountInString(req.Title) > 120 || req.ScheduleAt.IsZero() || len(req.Memo) > 12000 {
		fail(c, 400, "予定名と日時を入力してください")
		return
	}
	item := model.Schedule{UserID: uid(c)}
	if c.Param("id") != "" {
		if !owned(c, &item) {
			return
		}
	}
	item.Title = strings.TrimSpace(req.Title)
	item.ScheduleAt = req.ScheduleAt
	item.Memo = req.Memo
	if database.DB.Save(&item).Error != nil {
		fail(c, 500, "保存できませんでした")
		return
	}
	c.JSON(200, gin.H{"schedule": item})
}
func completeTask(c *gin.Context) {
	var task model.Task
	if !owned(c, &task) {
		return
	}
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		result := tx.Model(&model.Task{}).Where("id = ? AND user_id = ? AND done = ?", task.ID, uid(c), false).Update("done", true)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return nil
		}
		return tx.Model(&model.Character{}).Where("user_id = ?", uid(c)).Updates(map[string]interface{}{"level": gorm.Expr("level + (exp + 25) / 100"), "exp": gorm.Expr("(exp + 25) % 100")}).Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "達成を保存できませんでした")
		return
	}
	c.JSON(200, gin.H{"ok": true})
}
