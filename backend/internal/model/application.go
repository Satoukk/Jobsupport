package model

import (
	"time"
)

type Application struct {
	ID               int       `json:"id"`
	Company_id       string    `json:"company_id"`
	Application_date time.Time `json:"application_date"`
	Status           string    `json:"status"`
	Motivation       int       `json:"motivation"`
}
