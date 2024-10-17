ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

WORKDIR /app
COPY package.json .
RUN npm install

COPY . .
RUN chown -R node:node .

USER node
EXPOSE 3000

CMD node app.js
