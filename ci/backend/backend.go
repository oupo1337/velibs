package backend

import (
	"context"

	"dagger.io/dagger"
)

type Builder struct {
	client *dagger.Client
}

func (b *Builder) buildApplication() *dagger.Directory {
	src := b.client.Host().Directory("./backend")
	directoryOptions := dagger.ContainerWithDirectoryOpts{
		Exclude: []string{
			"./cmd/api/api",
			"./cmd/data-fetcher/data-fetcher",
		},
	}

	return b.client.Container().
		From("golang:1.20").
		WithDirectory("/src", src, directoryOptions).
		WithWorkdir("/src").
		WithExec([]string{"go", "build", "-o", "build/"}).
		Directory("build/")
}

func (b *Builder) buildImageWithDirectory(ctx context.Context, dir *dagger.Directory) error {
	_, err := b.client.Container().
		From("alpine:3.18.0").
		WithDirectory("/application", dir).
		Export(ctx, "build/backend.tar")
	return err
}

func (b *Builder) Build(ctx context.Context) error {
	application := b.buildApplication()
	return b.buildImageWithDirectory(ctx, application)
}

func New(client *dagger.Client) *Builder {
	return &Builder{
		client: client.Pipeline("backend"),
	}
}
