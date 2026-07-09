package model

import "time"

type GroupTask struct {
	ID                  int       `json:"id" gorm:"column:id"`
	GroupID             int       `json:"group_id" gorm:"column:group_id"`
	UserID              int       `json:"user_id" gorm:"column:user_id"`
	Title               string    `json:"title" gorm:"column:title"`
	Content             string    `json:"content" gorm:"column:content"`
	WeekDays            string    `json:"week_days" gorm:"column:week_days"`
	StartTime           string    `json:"start_time" gorm:"column:start_time"`
	RequiredMinutes     int       `json:"required_minutes" gorm:"column:required_minutes"`
	Priority            string    `json:"priority" gorm:"column:priority"`
	Color               string    `json:"color" gorm:"column:color"`
	Period              string    `json:"period" gorm:"column:period"`
	NotificationEnabled bool      `json:"notification_enabled" gorm:"column:notification_enabled"`
	StartDate           string    `json:"start_date" gorm:"column:start_date"`
	EndDate             string    `json:"end_date" gorm:"column:end_date"`
	Status              string    `json:"status" gorm:"column:status"`
	CreatedAt           time.Time `json:"created_at" gorm:"column:created_at"`
}

func (GroupTask) TableName() string {
	return "group_tasks"
}
