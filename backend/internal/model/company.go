package model

type Company struct {
	ID          int    `json:"id" gorm:"column:id"`
	CompanyName string `json:"company_name" gorm:"column:company_name"`
	Industry    string `json:"industry" gorm:"column:industry"`
	Memo        string `json:"memo" gorm:"column:memo"`
	UserID      int    `json:"userid" gorm:"column:user_id"`
}

type SerchName struct {
	CompanyName string `json:"company_name"`
}

func (Company) TableName() string {
	return "company"
}
