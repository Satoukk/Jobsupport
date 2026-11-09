package database

import (
	"Jobsupport/backend/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"os"
)

var DB *gorm.DB

func Connect() error {
	var err error
	if dsn := os.Getenv("DATABASE_URL"); dsn != "" {
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	} else {
		path := os.Getenv("SQLITE_PATH")
		if path == "" {
			path = "jobsupport.db"
		}
		DB, err = gorm.Open(sqlite.Open(path+"?_busy_timeout=5000&_foreign_keys=on"), &gorm.Config{})
	}
	if err != nil {
		return err
	}
	return DB.AutoMigrate(&model.User{}, &model.Session{}, &model.Character{}, &model.Company{}, &model.Task{}, &model.Schedule{})
}
