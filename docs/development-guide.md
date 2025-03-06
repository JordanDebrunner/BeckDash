# BeckDash Development Guide

## Getting Started

This guide provides instructions for setting up your development environment for BeckDash.

## Prerequisites

* Node.js (v16+)
* Docker and Docker Compose
* Git
* PostgreSQL (for local development without Docker)
* Redis (for local development without Docker)

## Initial Setup

1. Clone the repository:
   `
   git clone https://github.com/yourusername/beckdash.git
   cd beckdash
   `

2. Install dependencies:
   `
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   `

3. Configure environment variables:
   `
   # Copy the example .env file
   cp .env.example .env
   # Edit .env with your own values
   `

## Development Environment

### Using Docker Compose

The easiest way to set up all required services:

`
docker-compose up -d
`

This will start:
* PostgreSQL database
* Redis cache
* Backend API server
* Frontend development server

### Running Locally

#### Backend

`
cd server
npm run dev
`

#### Frontend

`
cd client
npm run dev
`

## Database Management

### Migrations

Create a new migration after schema changes:

`
npx prisma migrate dev --name <descriptive_name>
`

Apply migrations:

`
npx prisma migrate deploy
`

### Database Studio

Visualize and edit your database:

`
npx prisma studio
`

## Code Quality

### Linting

`
# In client directory
npm run lint

# In server directory
npm run lint
`

### Testing

`
# In client directory
npm run test

# In server directory
npm run test
`

## Building for Production

### Backend

`
cd server
npm run build
`

### Frontend

`
cd client
npm run build
`

## Deployment

The application is configured for deployment on Railway:

1. Push changes to the GitHub repository
2. GitHub Actions will run the CI pipeline
3. If successful, changes will be deployed to Railway

## Troubleshooting

### Common Issues

#### Database Connection Issues
* Check that PostgreSQL is running
* Verify DATABASE_URL in .env file

#### Redis Connection Issues
* Check that Redis is running
* Verify REDIS_URL in .env file

#### API Errors
* Check server logs: docker-compose logs backend
* Verify API endpoints match documentation

#### Frontend Build Errors
* Clear node_modules: m -rf node_modules && npm install
* Check for TypeScript errors: 
pm run type-check
