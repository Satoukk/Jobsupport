package routes

import (
	"Jobsupport/backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	api.GET("/health", handlers.Health)
	api.POST("/users", handlers.CreateUser)
	api.GET("/users/:userId/companies", handlers.GetCompany)
	api.GET("/companies/:id", handlers.ShowCompany)
	api.GET("/serch/companies", handlers.SerchCompany)
	api.POST("/companies", handlers.CreateCompany)
	api.PUT("/companies/:id", handlers.UpdateCompany)
	api.DELETE("/companies/:id", handlers.DeleteCompany)
	api.GET("/users/:userId/characters", handlers.GetCharacters)
	api.GET("/characters/:id", handlers.ShowCharacter)
	api.POST("/characters", handlers.CreateCharacter)
	api.PUT("/characters/:id", handlers.UpdateCharacter)
	api.DELETE("/characters/:id", handlers.DeleteCharacter)
	api.GET("/applications", handlers.GetApplications)
	api.GET("/applications/:id", handlers.ShowApplication)
	api.POST("/applications", handlers.CreateApp)
	api.PUT("/applications/:id", handlers.UpdateApplication)
	api.POST("/group-tasks", handlers.CreateGroupTask)
}
