FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies with npm install to ensure package-lock.json is updated
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 