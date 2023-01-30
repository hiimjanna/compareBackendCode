FROM node:10.15.3-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

# http_port
EXPOSE 8000

CMD npm start