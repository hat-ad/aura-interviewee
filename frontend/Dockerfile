FROM node:20-slim AS runner

WORKDIR /app 

COPY . .

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]
