package handlers

import (
	"net/http"

	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"

	"github.com/gin-gonic/gin"
)

func CreateGroupTask(c *gin.Context) {
	var task model.GroupTask

	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエストが正しくありません",
		})
		return
	}

	if task.Color == "" {
		task.Color = "#FFAA00"
	}
	if task.Status == "" {
		task.Status = "active"
	}

	if err := database.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "グループタスクの登録に失敗しました",
			"detail": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"group_task": task,
	})
}
