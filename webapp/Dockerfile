FROM node:20.5 AS build

ARG API_URL
ARG MAPBOX_ACCESS_TOKEN
ARG MAP_STYLE

WORKDIR /build

COPY . /build
RUN npm install
RUN VITE_API_URL=$API_URL \
    VITE_MAPBOX_ACCESS_TOKEN=$MAPBOX_ACCESS_TOKEN \
    VITE_MAP_STYLE=$MAP_STYLE \
    npm run build

FROM nginx:1.25

COPY ./default.conf /etc/nginx/conf.d/default.conf

ENV NODE_ENV production
WORKDIR /var/www/velib
RUN rm -rf ./*

COPY --from=build /build/dist .

ENTRYPOINT ["nginx", "-g", "daemon off;"]