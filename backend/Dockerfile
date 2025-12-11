FROM node:20-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app ./ 

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
