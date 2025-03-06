# BeckDash

A modern dashboard application with user authentication, theme switching, profile management, and file uploads.

![BeckDash Logo](https://via.placeholder.com/1200x600/4F46E5/FFFFFF?text=BeckDash)

## Features

- **User Authentication**: Secure login, registration, and password management
- **Theme Switching**: Light, dark, and system theme options with real-time preview
- **Profile Management**: Update personal information and preferences
- **File Uploads**: Upload and manage profile images
- **Responsive Design**: Works seamlessly on mobile and desktop devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- React Router
- React Context API
- Axios for API requests

### Backend
- Node.js
- Express.js
- PostgreSQL with Prisma ORM
- Redis for session management
- JWT for authentication
- Multer for file uploads

### DevOps
- Docker & Docker Compose
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JordanDebrunner/BeckDash.git
cd BeckDash
```

2. Start the application using Docker Compose:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Development Setup

1. Install dependencies:
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

2. Set up environment variables:
```bash
# Copy example env files
cp .env.example .env
```

3. Start development servers:
```bash
# Start backend
cd server
npm run dev

# Start frontend
cd client
npm run dev
```

## Project Structure

```
BeckDash/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Backend Node.js application
│   ├── prisma/             # Prisma schema and migrations
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── uploads/            # Uploaded files storage
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # Project documentation
```

## Key Features Implementation

### Authentication System

The authentication system uses JWT tokens with refresh token rotation for secure user sessions. The system includes:

- User registration with email validation
- Login with secure password handling
- Automatic token refresh
- Password reset functionality
- Session management with Redis

### Theme Switching

The theme system supports three modes:

- Light theme
- Dark theme
- System theme (follows OS preference)

Themes are applied in real-time and saved to the user's profile. The implementation uses:

- React Context API for global theme state
- CSS variables for theme colors
- Local storage for guest preferences
- Database storage for authenticated users

### Profile Management

Users can manage their profile information:

- Update personal details (name, email)
- Change notification preferences
- Upload and manage profile images
- Change password

### File Upload System

The file upload system supports:

- Drag and drop interface
- Image preview before upload
- File type validation
- Size restrictions
- Secure storage on the server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Docker](https://www.docker.com/)