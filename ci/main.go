package main

import (
	"context"
	"log"
	"os"

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

	if err := frontend.New(client).Build(context.Background()); err != nil {
		log.Fatalf("frontend.Build error: %s", err.Error())
		return
	}

	if err := backend.New(client).Build(context.Background()); err != nil {
		log.Fatalf("backend.Build error: %s", err.Error())
		return
	}
}
