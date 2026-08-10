FROM node:20-alpine

WORKDIR /app

# Copy package files first to cache dependencies
COPY package*.json ./

RUN npm install

# Copy the rest of the application
COPY . .

# Expose port for Next.js
EXPOSE 3000

# Start Next.js in development mode (hot reloading)
CMD ["npm", "run", "dev"]