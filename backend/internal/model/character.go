package model

type Character struct {
	ID      int    `json:"id"`
	User_id int    `json:"user_id"`
	Name    string `json:"name"`
	Level   int    `json:"level"`
	Exp     int    `json:"exp"`
}
