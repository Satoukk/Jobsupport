package model

type User struct {
	ID       int    `json:"id" gorm:"column:id"`
	Username string `json:"username" gorm:"column:username"`
	Email    string `json:"email" gorm:"column:email"`
	Password string `json:"password" gorm:"column:password"`
}

type ReqUser struct {
	Email    string `json:"email" `
	Password string `json:"password"`
}
