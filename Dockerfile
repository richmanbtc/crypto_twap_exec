FROM node:14

ENV APP_ROOT=/app
WORKDIR $APP_ROOT

ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install

COPY . $APP_ROOT

CMD node main.js
