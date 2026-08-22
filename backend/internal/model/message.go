package model

type Message struct {
	id          int    `json:"id" gorm:"column:message_id"`
	message     string `json:"message" gorm:"column:message"`
	messagetype string `json:"type" gorm:"column:type"`
}
