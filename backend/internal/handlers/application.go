package handlers

import (
	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateApp(c *gin.Context) {
	var app model.Application

	if err := c.ShouldBindJSON(&app); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエストが正しくありません",
		})
		return
	}
	if err := database.DB.Create(&app).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "登録に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"app": app,
	})
}

func GetApplications(c *gin.Context) {
	applications := []model.Application{}

	if err := database.DB.Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "応募一覧の取得に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"applications": applications,
	})
}

func ShowApplication(c *gin.Context) {
	applicationID := c.Param("id")
	var app model.Application

	if err := database.DB.First(&app, applicationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "応募情報が見つかりません",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"app": app,
	})
}

func UpdateApplication(c *gin.Context) {
	applicationID := c.Param("id")
	var app model.Application

	if err := database.DB.First(&app, applicationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "応募情報が見つかりません",
		})
		return
	}

	if err := c.ShouldBindJSON(&app); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエストが正しくありません",
		})
		return
	}

	app.ID = 0
	if err := database.DB.Model(&model.Application{}).
		Where("id = ?", applicationID).
		Updates(app).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "応募情報の更新に失敗しました",
		})
		return
	}

	if err := database.DB.First(&app, applicationID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "更新後の応募情報取得に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"app": app,
	})
}
