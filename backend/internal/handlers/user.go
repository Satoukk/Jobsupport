package handlers

import (
	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

var users = []model.User{}

// ユーザー作成
func CreateUser(c *gin.Context) {
	var user model.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエストが正しくありません",
		})
		return
	}
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "DB登録失敗しました",
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"user": user,
	})
}

// ユーザーログイン
func LoginUser(c *gin.Context) {

}
