FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install multer@1.4.5-lts.1

# Copy the rest of the application
COPY . .

EXPOSE 5001

# Start the application
CMD ["npm", "start"] 