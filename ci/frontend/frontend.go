package frontend

import (
	"context"

	"dagger.io/dagger"
)

type Builder struct {
	client *dagger.Client
}

func (b *Builder) buildApplication() *dagger.Directory {
	frontendDirectory := b.client.Host().Directory("./webapp")
	directoryOptions := dagger.ContainerWithDirectoryOpts{
		Exclude: []string{"node_modules/", "dist/"},
	}

	return b.client.Container().
		From("node:20.1.0").
		WithDirectory("/src", frontendDirectory, directoryOptions).
		WithWorkdir("/src").
		WithExec([]string{"npm", "install"}).
		WithExec([]string{"npm", "run", "build"}).
		Directory("./dist")
}

func (b *Builder) buildImageWithDirectory(ctx context.Context, dir *dagger.Directory) error {
	_, err := b.client.Container().
		From("nginx:1.23-alpine").
		WithDirectory("/usr/share/nginx/html", dir).
		Export(ctx, "/tmp/frontend.tar")
	return err
}

func (b *Builder) Build(ctx context.Context) error {
	application := b.buildApplication()
	return b.buildImageWithDirectory(ctx, application)
}

func New(client *dagger.Client) *Builder {
	return &Builder{
		client: client.Pipeline("frontend"),
	}
}
