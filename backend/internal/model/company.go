package model

type Company struct {
	ID       int    `json:"id"`
	Industry string `json:"industry"`
	Memo     string `json:"memo"`
	UserId   int    `json:"userid"`
}
