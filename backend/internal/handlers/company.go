package handlers

import (
	"net/http"

	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"

	"github.com/gin-gonic/gin"
)

func GetCompany(c *gin.Context) {
	userId := c.Param("userId")
	companies := []model.Company{}

	if err := database.DB.
		Where("user_id = ?", userId).
		Find(&companies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "企業一覧の取得に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"companies": companies,
	})
}

func ShowCompany(c *gin.Context) {
	companyID := c.Param("id")
	var company model.Company

	if err := database.DB.First(&company, companyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "企業が見つかりません",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"company": company,
	})
}

func CreateCompany(c *gin.Context) {
	var company model.Company

	if err := c.ShouldBindJSON(&company); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエストが正しくありません",
		})
		return
	}

	if err := database.DB.Create(&company).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "企業の登録に失敗しました",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"company": company,
	})
}

func UpdateCompany(c *gin.Context) {
	companyID := c.Param("id")
	var company model.Company

	if err := database.DB.First(&company, companyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "企業が見つかりません",
		})
		return
	}

	if err := c.ShouldBindJSON(&company); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "リクエストが正しくありません",
		})
		return
	}

	company.ID = 0
	if err := database.DB.Model(&model.Company{}).
		Where("id = ?", companyID).
		Updates(company).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "企業の更新に失敗しました",
		})
		return
	}

	if err := database.DB.First(&company, companyID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "更新後の企業取得に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"company": company,
	})
}

func DeleteCompany(c *gin.Context) {
	companyID := c.Param("id")

	if err := database.DB.Delete(&model.Company{}, companyID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "企業の削除に失敗しました",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "企業を削除しました",
	})
}
