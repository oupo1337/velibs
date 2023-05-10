FROM golang:1.20 AS build

ADD . /build
WORKDIR /build

RUN CGO_ENABLED=0 go build -o backend

FROM alpine:latest

WORKDIR /app
COPY --from=build --chmod=0755 /build/backend /app/backend
COPY public /app/public

CMD [ "/app/backend" ]