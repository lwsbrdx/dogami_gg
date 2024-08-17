package main

import (
	"time"
)

type Dogami struct {
	ID            uint              `json:"nftId" gorm:"primaryKey"`
	Name          string            `json:"name"`
	Owner         string            `json:"owner"`
	Image         string            `json:"image"`
	Animation_url string            `json:"animation_url"`
	Description   string            `json:"description"`
	Attributes    []DogamiAttribute `json:"attributes" gorm:"foreignKey:nft_id"`
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
}

type DogamiAttribute struct {
	ID          uint                       `gorm:"primaryKey;serializer:json"`
	DisplayType DogamiAttributeDisplayType `json:"display_type" gorm:"serializer:json"`
	TraitType   string                     `json:"trait_type" gorm:"serializer:json"`
	Value       any                        `json:"value" gorm:"serializer:json"`
	Level       int                        `json:"level" gorm:"serializer:json"`
	MinValue    int                        `json:"min_value" gorm:"serializer:json"`
	MaxValue    int                        `json:"max_value" gorm:"serializer:json"`
	Rank        string                     `json:"rank" gorm:"serializer:json"`
	Bonus       int                        `json:"bonus" gorm:"serializer:json"`
	BonusLevel  int                        `json:"bonus_level" gorm:"serializer:json"`
	NftId       uint
}

type DogamiAttributeDisplayType string

const (
	date         DogamiAttributeDisplayType = "date"
	boost_number                            = "boost_number"
)

const (
	Velocity = "velocity"
	Swim     = "swim"
	Jump     = "jump"
	Balance  = "balance"
	Might    = "might"
	Instinct = "instinct"
)

var DogamiSkills = []string{
	Velocity,
	Swim,
	Jump,
	Balance,
	Might,
	Instinct,
}
