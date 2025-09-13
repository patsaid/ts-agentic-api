FROM node:20-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN apk update && apk upgrade --available && npm install --legacy-peer-deps && npm audit fix

COPY . .
CMD ["npx", "ts-node", "src/index.ts"]
