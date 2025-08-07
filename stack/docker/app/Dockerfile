FROM node:lts-alpine3.22

WORKDIR /app

# Install system dependencies including OpenSSL
RUN apk add --no-cache openssl

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
#RUN npm ci
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Expose the port the app will run on
EXPOSE 3000

# Start the application in development mode
# This allows for hot reloading when files change
CMD ["npm", "run", "dev"]
