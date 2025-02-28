FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

EXPOSE 5001

# Start the application
CMD ["npm", "start"] 