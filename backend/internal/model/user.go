package model

type User struct {
	ID                int    `json:"id" gorm:"column:id"`
	Username          string `json:"username" gorm:"column:username"`
	Email             string `json:"email" gorm:"column:email"`
	Password          string `json:"password" gorm:"column:password"`
	Email_verified    bool   `json:"email_verified" gorm:"column:email_verified" `
	VerificationToken string `json:"verification_token" gorm:"column:verification_token"`
}

type ReqUser struct {
	Email    string `json:"email" `
	Password string `json:"password"`
}
