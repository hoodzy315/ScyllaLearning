FROM node:10-alpine
COPY nodejs/ /app
WORKDIR /app
RUN npm install cassandra-driver
RUN npm install async

CMD ["node", "app.js"]
