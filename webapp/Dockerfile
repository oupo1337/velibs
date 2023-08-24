FROM node:20.1.0 AS build

ADD . /build
WORKDIR /build

RUN npm install --legacy-peer-deps
RUN npm run build

FROM nginx:1.23.4

WORKDIR /var/www/velib.runtheit.com
RUN rm -rf ./*

ADD default.conf /etc/nginx/conf.d
COPY --from=build /build/build .

ENTRYPOINT ["nginx", "-g", "daemon off;"]