FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy bot source code
COPY ./src ./src
COPY ./config ./config
COPY .env.example ./.env.example

# Create .env file if not provided (will be overridden by mounted volume)
RUN cp .env.example .env

# Set environment variables
ENV NODE_ENV=production

# Expose port for API access (if needed)
EXPOSE 3001

# Start the bot
CMD ["node", "src/index.js"] 