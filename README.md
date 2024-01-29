# velibs

To be able to start the project you need to create a `.env` file at the root.

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

You can then run the project by typing :

```
docker compose --profile production up
```