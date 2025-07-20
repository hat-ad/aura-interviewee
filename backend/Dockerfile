FROM node:20-slim AS builder

WORKDIR /app

COPY . .

RUN npm install && npm run build

# second stage
FROM node:20-slim AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

RUN npm install --omit=dev

EXPOSE 8000

CMD ["npm", "start"]