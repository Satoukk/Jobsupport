package handlers

import (
	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func getmessage(c *gin.Context) {
	var message model.Message
	messagetype := c.Query("type")

	if err := database.DB.Where("messagetype=?", messagetype).First(&message).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "データがありません",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": message,
	})
}
