FROM node:latest

WORKDIR /usr/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm buildc

EXPOSE 4000

CMD ["npm start"]