package main

import (
	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/routes"
	"path/filepath"
	"runtime"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	loadEnv()

	database.Connect()
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	routes.RegisterRoutes(r)

	r.Run(":8080")
}

func loadEnv() {
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		_ = godotenv.Load()
		return
	}

	backendDir := filepath.Clean(filepath.Join(filepath.Dir(currentFile), "..", ".."))
	_ = godotenv.Load(
		filepath.Join(backendDir, ".env"),
		".env",
		"backend/.env",
	)
}
