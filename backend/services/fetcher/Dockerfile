FROM golang:1.24-alpine AS build

ADD . /build
WORKDIR /build/services/fetcher

RUN CGO_ENABLED=0 go build -o fetcher

FROM alpine:latest

WORKDIR /app
COPY --from=build /build/services/fetcher/fetcher /app/fetcher

CMD [ "/app/fetcher" ]