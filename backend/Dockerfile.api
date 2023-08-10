FROM golang:1.21 AS build

ADD . /build
WORKDIR /build/cmd/api

RUN go build -o api

FROM ubuntu

RUN apt-get update && apt-get install -y ca-certificates

WORKDIR /app
COPY --from=build /build/cmd/api/api /app/api

CMD [ "/app/api" ]