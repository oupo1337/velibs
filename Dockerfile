FROM golang:1.20 AS build

ADD . /build
WORKDIR /build

RUN CGO_ENABLED=0 go build -o backend

FROM alpine:latest

COPY --from=build --chmod=0755 /build/backend /app/backend

CMD [ "/app/backend" ]