# Velib

## Introduction

This project aims to display open data to everyone in a convenient way.
You can find a live version [here](https://velib.runtheit.com).

## Installation

### Configuration

First, to be able to start the project you need to create a `.env` file at the root of the project.

```
# Domain for the application (used for CORS here)
APP_DOMAIN_NAME=http://localhost:3000

# API URL (used in the web application)
API_URL=http://localhost:8080

# Credentials for the database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# If you want to enable tracing on the application
TELEMETRY_ENABLED=1

# Your mapbox access token
# https://docs.mapbox.com/help/getting-started/access-tokens/
MAPBOX_ACCESS_TOKEN=<YOUR_MAPBOX_ACCESS_TOKEN>

# The mapbox style you want to use for the app
# https://docs.mapbox.com/api/maps/styles/
MAP_STYLE=mapbox://styles/mapbox/standard
```

### Running the project

#### docker compose

If you want to start the project using docker compose, simply type:

```
docker compose --profile production up
```

#### helm

If you want to deploy the helm chart, simply type:

```
docker compose build
```

```
helm upgrade --install velib helm
```

## Libraries used

Thanks to the open source community

- [Mapbox](https://www.mapbox.com/) with [mapbox-gl](https://github.com/mapbox/mapbox-gl-js) and [supercluster](https://github.com/mapbox/supercluster)
- The [Vis.gl](https://vis.gl/) suite and more precisely [react-map-gl](https://visgl.github.io/react-map-gl/) and [deck.gl](https://deck.gl/)
- [Apache Echarts](https://echarts.apache.org/en/index.html)

## License

This project is available under the MIT License.