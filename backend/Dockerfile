FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "run", "cluster"]
