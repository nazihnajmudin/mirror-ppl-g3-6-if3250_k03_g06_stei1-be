FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source & build
COPY . .
RUN npm run build

EXPOSE 8000

# Run schema sync then start server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run db:seed && npm start"]