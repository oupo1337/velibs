package main

import (
	"context"
	"log"
	"os"
	"sync"

	"dagger.io/dagger"

	"github.com/oupo1337/velibs/ci/backend"
	"github.com/oupo1337/velibs/ci/frontend"
)

func main() {
	client, err := dagger.Connect(context.Background(), dagger.WithLogOutput(os.Stdout))
	if err != nil {
		log.Fatalf("dagger.Connect error: %s", err.Error())
		return
	}
	defer func() { _ = client.Close() }()

	wg := new(sync.WaitGroup)
	wg.Add(2)
	go func() {
		defer wg.Done()
		if err := frontend.New(client).Build(context.Background()); err != nil {
			log.Fatalf("frontend.Build error: %s", err.Error())
			return
		}
	}()

	go func() {
		defer wg.Done()
		if err := backend.New(client).Build(context.Background()); err != nil {
			log.Fatalf("backend.Build error: %s", err.Error())
			return
		}
	}()
	wg.Wait()
}
