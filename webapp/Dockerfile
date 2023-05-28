FROM node:20.1.0 AS build

ADD . /build
WORKDIR /build

RUN npm install
RUN npm run build

FROM nginx:1.23.4

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=build /build/build .

ENTRYPOINT ["nginx", "-g", "daemon off;"]