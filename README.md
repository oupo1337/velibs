# velibs

To be able to start the project you need to create a .env file at the root.

```
APP_DOMAIN_NAME=http://localhost:3000
API_URL=http://localhost:8080

POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

TELEMETRY_ENABLED=1

MAPBOX_ACCESS_TOKEN=<YOUR_MAPBOX_ACCESS_TOKEN>
MAP_STYLE=mapbox://styles/mapbox/standard
```

You can then run the project by typing :

```
docker compose --profile production up
```