package main

import (
	"context"
	"fmt"
	"log"

	"dagger.io/dagger"
)

func buildBackend(ctx context.Context, client *dagger.Client) error {
	const buildPath = "build/"

	src := client.Host().Directory("./backend")

	golang := client.Container().From("golang:1.20")
	golang = golang.WithDirectory("/src", src).WithWorkdir("/src")

	golang = golang.WithExec([]string{"go", "build", "-o", buildPath})
	output := golang.Directory(buildPath)

	_, err := output.Export(ctx, buildPath)
	if err != nil {
		return fmt.Errorf("could not export build: %w", err)
	}
	return nil
}

func nodeContainer(ctx context.Context, client *dagger.Client) (*dagger.Container, error) {
	container := client.Container().From("node:20.1.0")

	output, err := container.WithExec([]string{"node", "--version"}).Stdout(ctx)
	if err != nil {
		return nil, fmt.Errorf("could not exec node: %w", err)
	}
	fmt.Printf("container running with version: %s", output)
	return container, nil
}

func buildFrontend(ctx context.Context, client *dagger.Client) error {
	frontendDirectory := client.Host().Directory("./webapp")
	directoryOptions := dagger.ContainerWithDirectoryOpts{
		Exclude: []string{"node_modules/", "dist/"},
	}

	c, err := nodeContainer(ctx, client)
	if err != nil {
		return fmt.Errorf("could not create node container")
	}

	_, err = c.WithDirectory("/src", frontendDirectory, directoryOptions).
		WithWorkdir("/src").
		WithExec([]string{"npm", "install"}).
		WithExec([]string{"npm", "run", "build"}).
		Directory("./build").
		Export(ctx, "./build")
	if err != nil {
		return fmt.Errorf("could not export build: %w", err)
	}
	return nil
}

func main() {
	client, err := dagger.Connect(context.Background())
	if err != nil {
		log.Fatalf("dagger.Connect error: %s", err.Error())
		return
	}
	defer func() {
		_ = client.Close()
	}()

	// if err := buildBackend(context.Background(), client); err != nil {
	// 	log.Fatalf("buildBackend error: %s", err.Error())
	// 	return
	// }

	if err := buildFrontend(context.Background(), client); err != nil {
		log.Fatalf("buildBackend error: %s", err.Error())
		return
	}
}
