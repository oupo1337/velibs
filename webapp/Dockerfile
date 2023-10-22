FROM node:20.5 AS build

WORKDIR /build

COPY . /build
RUN npm install --legacy-peer-deps
RUN npm run build

FROM nginx:1.25

COPY ./default.conf /etc/nginx/conf.d/default.conf

ENV NODE_ENV production
WORKDIR /var/www/velib.runtheit.com
RUN rm -rf ./*

COPY --from=build /build/dist .

ENTRYPOINT ["nginx", "-g", "daemon off;"]