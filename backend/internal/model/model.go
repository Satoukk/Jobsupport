package model

import "time"

type User struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email" gorm:"uniqueIndex"`
	Password string `json:"-"`
}
type Session struct {
	Token     string `gorm:"primaryKey"`
	UserID    uint
	ExpiresAt time.Time `gorm:"index"`
}
type Character struct {
	ID     uint   `json:"id"`
	UserID uint   `json:"-" gorm:"uniqueIndex"`
	Name   string `json:"name"`
	Level  int    `json:"level"`
	Exp    int    `json:"exp"`
}
type Company struct {
	ID          uint   `json:"id"`
	UserID      uint   `json:"-" gorm:"index"`
	CompanyName string `json:"company_name"`
	Industry    string `json:"industry"`
	Memo        string `json:"memo"`
	Status      string `json:"status"`
}

func (Company) TableName() string { return "company" }

type Task struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"-" gorm:"index"`
	Title     string    `json:"title"`
	Done      bool      `json:"done"`
	CreatedAt time.Time `json:"created_at"`
}
type Schedule struct {
	ID         uint      `json:"id"`
	UserID     uint      `json:"-" gorm:"index"`
	Title      string    `json:"title"`
	ScheduleAt time.Time `json:"schedule_at"`
	Memo       string    `json:"memo"`
}
