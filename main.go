package main

import (
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	cacheDir, err := os.UserCacheDir()
	log.Println("Cache Dir :", cacheDir)
	db, err := gorm.Open(sqlite.Open(cacheDir+"/dogamis.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	sqldb, err := db.DB()
	if err != nil {
		log.Fatal(err)
	}
	sqldb.SetMaxIdleConns(1_000)

	migrateError := db.AutoMigrate(
		&DogamiAttribute{},
		&Dogami{},
	)
	if migrateError != nil {
		log.Fatal(migrateError)
	}

	dogamiService := DogamiService{
		Db:  db,
		App: app,
	}

	// Create application with options
	application := &options.App{
		Title:         "DOGAMI.GG",
		Width:         1180,
		Height:        820,
		DisableResize: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			&Dogami{},
			&dogamiService,
		},
		EnumBind: []interface{}{
			AllDogamiEvents,
		},
		Mac: &mac.Options{
			WebviewIsTransparent: true,
		},
	}

	err = wails.Run(application)

	if err != nil {
		println("Error:", err.Error())
	}
}
