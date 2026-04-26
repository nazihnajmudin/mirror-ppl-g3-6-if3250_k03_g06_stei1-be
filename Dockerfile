FROM node:20-alpine

WORKDIR /app

# Install dependencies first (this layer is cached)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma Client (also cached if schema doesn't change)
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 8000

# Run schema sync, seed, and start
# Using 'sh -c' to chain commands at runtime
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run db:seed && npm start"]
