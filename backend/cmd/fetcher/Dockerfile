FROM golang:1.21 AS build

ADD . /build
WORKDIR /build/cmd/fetcher

RUN CGO_ENABLED=0 go build -o fetcher

FROM alpine:latest

WORKDIR /app
COPY --from=build /build/cmd/fetcher/fetcher /app/fetcher

CMD [ "/app/fetcher" ]