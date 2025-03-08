# BeckDash

BeckDash is a comprehensive dashboard application for managing household tasks, maintenance schedules, and more.

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React with TypeScript, using a component-based architecture
- **Backend**: Node.js with Express, providing RESTful API endpoints
- **Database**: MongoDB for data persistence
- **Authentication**: JWT-based authentication system

## Project Structure

```
BeckDash/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API service modules
│       └── utils/          # Utility functions
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
└── shared/                 # Shared code between client and server
    └── types/              # TypeScript type definitions
```

## Features

- **User Authentication**: Secure login and registration system
- **Dashboard**: Overview of important information
- **Maintenance Tracking**: Schedule and track household maintenance tasks
- **Calendar**: View scheduled tasks and events
- **Profile Management**: User profile settings

## Development Setup

### Prerequisites

- Node.js (v14+)
- Docker and Docker Compose
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/BeckDash.git
   cd BeckDash
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up
   ```

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api/v1

## API Documentation

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and receive JWT token

### Maintenance Tasks

- `GET /api/v1/maintenance` - Get all maintenance tasks
- `GET /api/v1/maintenance/:id` - Get a specific maintenance task
- `POST /api/v1/maintenance` - Create a new maintenance task
- `PUT /api/v1/maintenance/:id` - Update a maintenance task
- `DELETE /api/v1/maintenance/:id` - Delete a maintenance task
- `PUT /api/v1/maintenance/:id/toggle-completion` - Toggle task completion status
- `GET /api/v1/maintenance/status/overdue` - Get overdue tasks
- `GET /api/v1/maintenance/status/upcoming` - Get upcoming tasks

## Code Quality and Best Practices

The project follows these best practices:

1. **Type Safety**: Extensive use of TypeScript for type checking
2. **Shared Types**: Common types shared between client and server
3. **Error Handling**: Standardized error handling across the application
4. **API Utilities**: Consistent API request/response handling
5. **Component Structure**: Reusable and modular component design
6. **Authentication**: Secure JWT-based authentication
7. **Code Organization**: Clear separation of concerns

## Recent Improvements

- Added shared type definitions between client and server
- Implemented standardized API response handling
- Enhanced error management with custom error classes
- Improved authentication middleware
- Created utility functions for API requests
- Standardized controller and service error handling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Your Name - Initial work and maintenance