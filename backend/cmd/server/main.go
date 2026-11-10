package main

import (
	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	_ = godotenv.Load()
	if err := database.Connect(); err != nil {
		log.Fatal(err)
	}
	r := gin.Default()
	_ = r.SetTrustedProxies(nil)
	r.Use(func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Next()
	})
	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins == "" {
		origins = "http://localhost:5173,http://127.0.0.1:5173"
	}
	r.Use(cors.New(cors.Config{AllowOrigins: strings.Split(origins, ","), AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, AllowHeaders: []string{"Content-Type", "Authorization"}}))
	routes.RegisterRoutes(r)
	if web := os.Getenv("STATIC_DIR"); web != "" {
		r.Static("/assets", filepath.Join(web, "assets"))
		r.NoRoute(func(c *gin.Context) {
			if c.Request.Method != "GET" || strings.HasPrefix(c.Request.URL.Path, "/api/") || c.Request.URL.Path == "/api" {
				c.JSON(http.StatusNotFound, gin.H{"error": "ページが見つかりません"})
				return
			}
			c.File(filepath.Join(web, "index.html"))
		})
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(r.Run(":" + port))
}
