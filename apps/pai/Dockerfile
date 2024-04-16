FROM nginx:alpine as ui
LABEL MAINTAINER="kubegems"
WORKDIR /usr/src/app

ENV PAI_SERVER=kubegems-pai-api API_SERVER=kubegems-api

COPY dist dist
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

CMD ["nginx", "-g", "daemon off;"]
