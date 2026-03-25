# Use Node 20 Debian-slim (avoids Alpine musl/OpenSSL issues)
FROM node:20-slim

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy everything including node_modules from host
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose the port Next.js runs on
EXPOSE 3000

# Run db push (create/migrate DB) then start the app
CMD ["sh", "-c", "npx prisma db push && npm start"]
