FROM node:20-alpine

# Install libc6-compat for Next.js/Turbopack on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]
