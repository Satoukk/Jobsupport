package model

import (
	"time"
)

type Schedule struct {
	Application_id int       `json:"application"`
	ID             int       `json:"id"`
	Title          string    `json:"title"`
	Schedule_type  string    `json:"schedule_type"`
	Schedule_at    time.Time `json:"schedule_at"`
	Memo           string    `json:"memo"`
}
