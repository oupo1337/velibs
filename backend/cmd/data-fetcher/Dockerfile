FROM golang:1.21 AS build

ADD . /build
WORKDIR /build/cmd/data-fetcher

RUN CGO_ENABLED=0 go build -o data-fetcher

FROM alpine:latest

WORKDIR /app
COPY --from=build /build/cmd/data-fetcher/data-fetcher /app/data-fetcher

CMD [ "/app/data-fetcher" ]