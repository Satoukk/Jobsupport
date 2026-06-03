package routes

import (
	"Jobsupport/backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	api.GET("/health", handlers.Health)
	api.GET("/users/:userId/companies", handlers.GetCompany)
	api.GET("/companies/:id", handlers.ShowCompany)
	api.POST("/companies", handlers.CreateCompany)
	api.PUT("/companies/:id", handlers.UpdateCompany)
	api.DELETE("/companies/:id", handlers.DeleteCompany)
}
