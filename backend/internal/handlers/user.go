package handlers

import (
	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/resend/resend-go/v3"
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

// ユーザー情報取得
func Usercertification(c *gin.Context) {
	var req model.User
	var user model.User

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(500, gin.H{
			"error": "引数がありません",
		})
		return
	}

	if err := database.DB.Where("id = ?", req.ID).
		Find(&user).Error; err != nil {
		c.JSON(500, gin.H{
			"error": "ユーザーがいません",
		})
		return
	}
	c.JSON(201, gin.H{
		"user": user,
	})
}

// メールを送信関数
func SendEmail(c *gin.Context) {
	var req model.User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(500, gin.H{
			"error": "データがありません",
		})
		return
	}

	token, err := generateVerificationToken()
	if err != nil {
		c.JSON(500, gin.H{
			"error": "認証トークンの作成に失敗しました",
		})
		return
	}

	req.VerificationToken = token
	if err := database.DB.Create(&req).Error; err != nil {
		c.JSON(500, gin.H{
			"error": "データがありません",
		})
	}
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "RESEND_API_KEY is not set",
		})
		return
	}

	//メール送信コード
	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From:    "onboarding@resend.dev",
		To:      []string{req.Email},
		Subject: "Hello World",
		Html: "<p>メール認証です<strong>こちらのコードをアプリで入力してください</strong>!</p>" +
			"<h2>" + req.VerificationToken + "</h2>",
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Printf("failed to send email: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to send email",
		})
		return
	}

	log.Printf("email sent: %s", sent.Id)
	c.JSON(http.StatusOK, gin.H{
		"id": req.ID,
	})
}

// ランダムのコード生成
func generateVerificationToken() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%06d", n.Int64()), nil
}

// コードの認証
func Certification(c *gin.Context) {
	var req model.User
	var user model.User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"error": "データがありません",
		})
		return
	}
	if err := database.DB.Where("id = ?", req.ID).
		Find(&user).Error; err != nil {
		c.JSON(500, gin.H{
			"error": "データがありません",
		})
		return
	}

	if req.VerificationToken == user.VerificationToken {
		user.Email_verified = true
	} else {
		c.JSON(400, gin.H{
			"error": "コードが間違っています",
		})
		return
	}

	if err := database.DB.Model(&user).Updates(map[string]interface{}{
		"email_verified":     true,
		"verification_token": user.VerificationToken,
	}).Error; err != nil {
		c.JSON(500, gin.H{
			"error": "認証コードの保存に失敗しました",
		})
		return
	}
	c.JSON(200, gin.H{
		"answer": true,
	})
}
