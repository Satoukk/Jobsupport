package handlers

import (
	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

// スケジュール追加
func CreateSchedule(c *gin.Context) {
	var schedules model.Schedule

	if err := c.ShouldBindJSON(&schedules); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエストが正しくありません",
		})
		return
	}

	if err := database.DB.Create(&schedules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "企業の登録に失敗しました",
		})
		return
	}
}

// スケジュール取得
func ShowSchedule(c *gin.Context) {
	var schedules model.Schedule

	if err := database.DB.Find(&schedules).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "スケジュールを取得できませんでした",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"schedule": schedules,
	})
}

// スケジュール更新
func UpdateSchedule(c *gin.Context) {
	var schedules model.Schedule
	scheduleid := c.Param("id")

	if err := database.DB.First(&schedules, scheduleid).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "更新データがありません",
		})
		return
	}

	if err := c.ShouldBindJSON(&schedules).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "データが取得できません",
		})
		return
	}

	if err := database.DB.Model(&model.Schedule{}).
		Where("id=?", scheduleid).
		Updates(schedules).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "スケジュールの更新に失敗しました",
		})
	}

	if err := database.DB.First(&schedules, scheduleid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "更新後の取得に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"schedule": schedules,
	})
}

// スケジュール削除
func DeleteSchedule(c *gin.Context) {

	scheduleid := c.Param("id")

	if err := database.DB.Delete(&model.Schedule{}, scheduleid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "企業の削除に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "企業を削除しました",
	})
}
