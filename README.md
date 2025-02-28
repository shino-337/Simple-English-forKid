# English Learning App

A web application for learning English vocabulary, designed for children and language learners.

## Features

- User authentication (register, login, profile management)
- Admin and regular user roles
- Study mode for learning vocabulary
- Challenge mode for testing knowledge
- Progress tracking

## Tech Stack

- **Frontend**: React, Redux, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Getting Started with Docker

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Clone the repository:

```
git clone <repository-url>
cd english-app
```

2. Start the application using Docker Compose:

```
docker-compose up
```

This will:
- Build and start the MongoDB, backend, and frontend containers
- Set up the database with seed data (including admin and regular users)
- Make the frontend available at http://localhost:3000
- Make the backend API available at http://localhost:5001

3. To stop the application:

```
docker-compose down
```

### Test Users

The following test users are available for login:

| Type | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Admin | teacher@example.com | teacher123 |
| Regular | user@example.com | user123 |
| Student | student1@example.com | student123 |
| Student | student2@example.com | student123 |

## Development

### Running Without Docker

#### Backend

```
cd backend
npm install
npm start
```

#### Frontend

```
cd frontend
npm install
npm run dev
```

## License

This project is licensed under the MIT License. 