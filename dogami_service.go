package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type DogamiEvents string

const (
	DogamiSaved             = "dogami:saved"
	DogamisDownloadStart    = "dogamis:download:start"
	DogamisDownloadProgress = "dogamis:download:progress"
	DogamisDownloadDone     = "dogamis:download:done"
)

var AllDogamiEvents = []struct {
	Value  DogamiEvents
	TSName string
}{
	{DogamiSaved, "DogamiSaved"},
	{DogamisDownloadStart, "DogamiDownloadStart"},
	{DogamisDownloadProgress, "DogamiDownloadProgress"},
	{DogamisDownloadDone, "DogamiDownloadDone"},
}

type DogamiEvent struct {
	Dogami Dogami `json:"dogami"`
}

type DogamisDownloadProgressEvent struct {
	Downloaded uint `json:"downloaded"`
	Total      uint `json:"total"`
}

type DogamiService struct {
	Db  *gorm.DB
	App *App
}

type PolygonScanCountResult struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Result  string `json:"result"`
}

func (ds *DogamiService) downloadDogami(id uint) (Dogami, error) {
	emptyDogami := Dogami{}
	resp, err := http.Get(fmt.Sprintf("https://proxy.dogami.com/metadata/dogami/ids/%v", id))
	if err != nil {
		return emptyDogami, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		var d []Dogami
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			return emptyDogami, err
		}

		unmarshallErr := json.Unmarshal(bodyBytes, &d)
		if unmarshallErr != nil {
			return emptyDogami, unmarshallErr
		}

		return d[0], nil
	}

	return Dogami{}, errors.New("couldn't download Dogami")
}

func (ds *DogamiService) count() (uint, error) {
	var dogamisCount uint = 0
	dogamisContracts := []string{
		"0xa3f2D95fF09ef87eb228D1Aa965e06DB4e9Ce71b", // Alpha
		"0xb953ACa746f3b4AB5C9E5A6aa9A6C986a8599Be5", // Gamma
	}

	for _, dogamiContract := range dogamisContracts {
		result := PolygonScanCountResult{}
		resp, err := http.Get(
			fmt.Sprintf(
				"https://api.polygonscan.com//api?module=stats&action=tokensupply&contractaddress=%v&apikey=ERTJWC6J24SDUXM9HIWX2CGV28UME85BXN",
				dogamiContract,
			),
		)

		if err != nil {
			return 0, err
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			bodyBytes, err := io.ReadAll(resp.Body)
			if err != nil {
				return 0, err
			}

			log.Println(string(bodyBytes))

			err = json.Unmarshal(bodyBytes, &result)
			if err != nil {
				return 0, err
			}

			collectionTotal, err := strconv.ParseInt(result.Result, 10, 64)
			if err != nil {
				return 0, err
			}
			dogamisCount += uint(collectionTotal)
		}
	}

	return dogamisCount, nil
}

func (ds *DogamiService) DownloadAllDogamis() {
	totalDogamis, err := ds.count()
	if err != nil {
		log.Fatal(err)
	}

	// TEST PURPOSE
	// totalDogamis = 1000

	progressEvent := DogamisDownloadProgressEvent{
		Total: totalDogamis,
	}

	err = ds.Db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&DogamiAttribute{}).Error
	if err != nil {
		log.Println(err)
	}

	dogamisChan := make(chan Dogami, 100)
	doneChan := make(chan bool, 1)
	go func() {
		runtime.EventsEmit(ds.App.ctx, DogamisDownloadStart)
		time.Sleep(250 * time.Millisecond)

		for i := range totalDogamis {
			dogami, err := ds.downloadDogami(uint(i + 1))
			if err != nil {
				log.Print(err)
				return
			}

			dogamisChan <- dogami
		}
		doneChan <- true
	}()

	go func() {
		start := time.Now()

	readChannels:
		for {
			select {
			case dogami := <-dogamisChan:
				ds.SaveDogami(dogami, false)
				progressEvent.Downloaded++
				runtime.EventsEmit(ds.App.ctx, DogamisDownloadProgress, &progressEvent)
			case done := <-doneChan:
				if done {
					time.Sleep(250 * time.Millisecond)
					runtime.EventsEmit(ds.App.ctx, DogamisDownloadDone)
					break readChannels
				}
			}
		}

		elapsed := time.Since(start)
		fmt.Println("Elapsed time : ", elapsed)
	}()
}

func (ds *DogamiService) GetDogami(id uint) (Dogami, error) {
	if ds.DogamiExists(id) {
		return ds.FindDogami(id), nil
	}

	dogami, err := ds.downloadDogami(id)
	if dogami.ID != 0 {
		ds.SaveDogami(dogami, true)
	}
	return dogami, err
}

func (ds *DogamiService) UpdateDogami(id uint) (Dogami, error) {
	dogami, err := ds.downloadDogami(id)
	if dogami.ID != 0 {
		ds.SaveDogami(dogami, true)
	}
	return dogami, err
}

func (ds *DogamiService) SaveDogami(d Dogami, shouldEmitEvent bool) error {
	var err error
	if ds.DogamiExists(d.ID) {
		err = ds.Db.Updates(&d).Error
		if err != nil {
			return err
		}

		err = ds.Db.Model(&d).Association("Attributes").Replace(d.Attributes)
	} else {
		err = ds.Db.Create(&d).Error
	}

	if err != nil {
		return err
	}

	if shouldEmitEvent {
		runtime.EventsEmit(
			ds.App.ctx,
			DogamiSaved,
			&DogamiEvent{
				Dogami: d,
			},
		)
	}

	return nil
}

func (ds *DogamiService) FindDogami(nftId uint) Dogami {
	dogami := Dogami{
		ID: nftId,
	}
	err := ds.Db.
		Preload(clause.Associations).
		First(&dogami).Error

	if err != nil {
		log.Fatal(err)
	}

	if err != nil {
		log.Fatal(err)
	}

	return dogami
}

func (ds *DogamiService) DogamiExists(nftId uint) bool {
	dogami := Dogami{
		ID: nftId,
	}
	result := ds.Db.First(&dogami)

	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		log.Fatal(result.Error)
	}

	if result.RowsAffected > 0 {
		return true
	}

	return false
}

func (ds *DogamiService) FindAllDogamis() []Dogami {
	dogamis := []Dogami{}
	err := ds.Db.
		Preload(clause.Associations).
		Find(&dogamis).Error

	if err != nil {
		log.Fatal(err)
	}

	return dogamis
}

func (ds *DogamiService) SearchDogami(needle string) []Dogami {
	dogamis := []Dogami{}
	err := ds.Db.
		Preload(clause.Associations).
		Where(fmt.Sprintf("name LIKE '%%%v'", needle)).
		Find(&dogamis).Error

	if err != nil {
		log.Fatal(err)
	}

	return dogamis
}
