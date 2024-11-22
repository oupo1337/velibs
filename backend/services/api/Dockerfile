FROM golang:1.23.3-alpine AS build

ADD . /build
WORKDIR /build/services/api

RUN CGO_ENABLED=0 go build -o api

FROM alpine:latest

WORKDIR /app
COPY --from=build /build/services/api/api /app/api

CMD [ "/app/api" ]