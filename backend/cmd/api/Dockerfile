FROM golang:1.21 AS build

ADD . /build
WORKDIR /build/cmd/api

RUN CGO_ENABLED=0 go build -o api

FROM alpine:latest

WORKDIR /app
COPY --from=build /build/cmd/api/api /app/api

CMD [ "/app/api" ]