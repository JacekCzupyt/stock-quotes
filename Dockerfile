FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
COPY ormconfig.docker.json ./ormconfig.json

ENV PORT=3000

EXPOSE 3000

CMD [ "npm", "run", "start"]