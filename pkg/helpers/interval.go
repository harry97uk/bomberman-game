package helpers

import (
	"log"
	"time"
)

type Interval struct {
	stopChan chan bool
}

func SetInterval(callback func(), interval time.Duration, stopCondition func() bool) *Interval {
	stopChan := make(chan bool)
	ticker := time.NewTicker(interval)

	go func() {
		defer ticker.Stop()
		log.Println("Interval started")
		for {
			select {
			case <-ticker.C:
				callback()
			case <-stopChan:
				return
			}
		}
	}()

	go func() {
		for {
			if stopCondition() {
				log.Println("Stopping Interval...")
				stopChan <- true
				return
			}
			time.Sleep(100 * time.Millisecond) // Poll for the stop condition
		}
	}()

	intervalInstance := &Interval{
		stopChan: stopChan,
	}

	return intervalInstance
}

func (i *Interval) Reset() {
	i.stopChan <- true
}
