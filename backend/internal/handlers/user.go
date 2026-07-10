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
	var users model.User

	if err := c.ShouldBindJSON(&users); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエストが正しくありません",
		})
		return
	}

	if users.Username == "" {
		c.JSON(400, gin.H{
			"error": "ユーザー名を入力してください",
		})
		return
	}
	if users.Email == "" {
		c.JSON(400, gin.H{
			"error": "メールアドレスを入力してください",
		})
		return
	}

	if len(users.Password) < 8 {
		c.JSON(400, gin.H{
			"error": "パスワードを入力してください",
		})
		return
	}

	if err := database.DB.Create(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "DB登録失敗しました",
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"user": users,
	})
}

// ユーザーログイン
func LoginUser(c *gin.Context) {
	var req model.ReqUser
	var user model.User

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(500, gin.H{
			"error": "データを入力してください",
		})
		return
	}

	if err := database.DB.
		Where("email = ? AND password = ?", req.Email, req.Password).
		Find(&user).Error; err != nil {
		c.JSON(500, gin.H{
			"error": "メールアドレスかパスワードが正しくありません",
		})
		return
	}

	c.JSON(201, gin.H{
		"user": user,
	})
}
