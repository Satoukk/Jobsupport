package handlers

import (
	"net/http"

	"Jobsupport/backend/internal/database"
	"Jobsupport/backend/internal/model"

	"github.com/gin-gonic/gin"
)

func GetCharacters(c *gin.Context) {
	userID := c.Param("userId")
	characters := []model.Character{}

	if err := database.DB.
		Where("user_id = ?", userID).
		Find(&characters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get characters",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"characters": characters,
	})
}

func ShowCharacter(c *gin.Context) {
	characterID := c.Param("id")
	var character model.Character

	if err := database.DB.First(&character, characterID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "character not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"character": character,
	})
}

func CreateCharacter(c *gin.Context) {
	var character model.Character

	if err := c.ShouldBindJSON(&character); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	if err := database.DB.Create(&character).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create character",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"character": character,
	})
}

func UpdateCharacter(c *gin.Context) {
	characterID := c.Param("id")
	var character model.Character

	if err := database.DB.First(&character, characterID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "character not found",
		})
		return
	}

	if err := c.ShouldBindJSON(&character); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	character.ID = 0
	if err := database.DB.Model(&model.Character{}).
		Where("id = ?", characterID).
		Updates(character).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update character",
		})
		return
	}

	if err := database.DB.First(&character, characterID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get updated character",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"character": character,
	})
}

func DeleteCharacter(c *gin.Context) {
	characterID := c.Param("id")

	if err := database.DB.Delete(&model.Character{}, characterID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to delete character",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "character deleted",
	})
}
