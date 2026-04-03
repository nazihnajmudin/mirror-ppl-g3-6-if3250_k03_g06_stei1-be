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

# Run migration then start server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]