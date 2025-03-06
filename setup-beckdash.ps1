# BeckDash Project Structure Generator
# This script creates the complete file structure for the BeckDash application
# Execute from the root BeckDash directory

# Store the base directory path
$baseDir = Get-Location

# Function to create a directory if it doesn't exist
function Create-DirectoryIfNotExists {
    param (
        [string]$Path
    )
    if (-not (Test-Path -Path $Path)) {
        New-Item -Path $Path -ItemType Directory | Out-Null
        Write-Host "Created directory: $Path" -ForegroundColor Green
    }
}

# Function to create a file if it doesn't exist
function Create-FileIfNotExists {
    param (
        [string]$Path,
        [string]$Content = ""
    )
    if (-not (Test-Path -Path $Path)) {
        New-Item -Path $Path -ItemType File | Out-Null
        if ($Content -ne "") {
            Set-Content -Path $Path -Value $Content
        }
        Write-Host "Created file: $Path" -ForegroundColor Cyan
    }
}

# Create root level directories and files
Create-DirectoryIfNotExists -Path "$baseDir\client"
Create-DirectoryIfNotExists -Path "$baseDir\server"
Create-DirectoryIfNotExists -Path "$baseDir\prisma"
Create-DirectoryIfNotExists -Path "$baseDir\docs"
Create-DirectoryIfNotExists -Path "$baseDir\.github"

# Create .gitignore
Create-FileIfNotExists -Path "$baseDir\.gitignore" -Content "# Node modules
node_modules/

# Environment variables
.env
.env.local
.env.development
.env.test
.env.production

# Build files
/client/dist
/server/dist

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS specific
.DS_Store
Thumbs.db

# Prisma
/prisma/migrations/*
!/prisma/migrations/.gitkeep

# Cache
.cache
.eslintcache
.npm
.pnp
.pnp.js
.yarn/
.yarn-integrity"

# Create README.md with properly escaped content for PowerShell
$readmeContent = @"
# BeckDash: A Comprehensive Home Management Platform

BeckDash is a unified, scalable, and highly customizable home management system designed to streamline daily household tasks, integrate essential services, and provide an intuitive, user-friendly experience.

## Core Features

### Calendar and Scheduling Hub
* Task and Event Scheduling
* Reminders and Notifications
* Recurring Tasks Support
* Task Prioritization and Categorization
* Weather Integration

### Weather Dashboard
* Current and Forecast Data
* Severe Weather Alerts
* Smart Recommendations

### Plant Care and Gardening Assistant
* Plant Profiles
* Automated Care Reminders
* Seasonal Adjustments

### Recipe and Meal Planning System
* Personal Recipe Book
* Ingredient Inventory Management
* Automated Shopping List
* Nutritional Information Integration

### Home Maintenance and Chore Manager
* Maintenance Logs
* Chore Assignments
* Home Improvement Tracking

### Smart Home Integration (Future)
* IoT Synchronization
* Automated Routines
* Voice Assistant Compatibility

## Technology Stack

### Frontend
* React with TypeScript
* Tailwind CSS for styling
* Shadcn UI components
* React Router for navigation

### Backend
* Node.js + Express
* JWT Authentication
* Redis for caching
* PostgreSQL database with Prisma ORM

### DevOps
* Docker for containerization
* GitHub Actions for CI/CD
* Railway for cloud hosting

## License

This project is licensed under the MIT License - see the LICENSE file for details.
"@

Create-FileIfNotExists -Path "$baseDir\README.md" -Content $readmeContent

# Create docker-compose.yml
Create-FileIfNotExists -Path "$baseDir\docker-compose.yml" -Content "version: '3.8'

services:
  postgres:
    image: postgres:14
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: beckdash
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/beckdash
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./server:/app
      - /app/node_modules

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - '5173:5173'
    depends_on:
      - backend
    volumes:
      - ./client:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:"

# Create .env.example
Create-FileIfNotExists -Path "$baseDir\.env.example" -Content "# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beckdash

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# API Keys
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here

# Environment
NODE_ENV=development
PORT=3000"

# Create client directory structure
$clientSrcPath = "$baseDir\client\src"
Create-DirectoryIfNotExists -Path $clientSrcPath

# Client components directories
Create-DirectoryIfNotExists -Path "$clientSrcPath\components"
Create-DirectoryIfNotExists -Path "$clientSrcPath\components\common"
Create-DirectoryIfNotExists -Path "$clientSrcPath\components\calendar"
Create-DirectoryIfNotExists -Path "$clientSrcPath\components\weather"
Create-DirectoryIfNotExists -Path "$clientSrcPath\components\plants"
Create-DirectoryIfNotExists -Path "$clientSrcPath\components\recipes"
Create-DirectoryIfNotExists -Path "$clientSrcPath\components\dashboard"
Create-DirectoryIfNotExists -Path "$clientSrcPath\components\maintenance"

# Create common components files
Create-FileIfNotExists -Path "$clientSrcPath\components\common\Button.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\components\common\Modal.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\components\common\Header.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\components\common\Sidebar.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\components\common\Layout.tsx"

# Create calendar components files
Create-FileIfNotExists -Path "$clientSrcPath\components\calendar\EventModal.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\components\calendar\CalendarGrid.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\components\calendar\CategoryBadge.tsx"

# Create weather components files
Create-FileIfNotExists -Path "$clientSrcPath\components\weather\WeatherWidget.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\components\weather\ForecastCard.tsx"

# Create plant components files
Create-FileIfNotExists -Path "$clientSrcPath\components\plants\PlantCard.tsx"

# Create recipe components files
Create-FileIfNotExists -Path "$clientSrcPath\components\recipes\RecipeForm.tsx"

# Create dashboard components files
Create-FileIfNotExists -Path "$clientSrcPath\components\dashboard\EventCard.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\components\dashboard\TaskItem.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\components\dashboard\PlantCareCard.tsx"

# Create maintenance components files
Create-FileIfNotExists -Path "$clientSrcPath\components\maintenance\TaskList.tsx"

# Create other client directories
Create-DirectoryIfNotExists -Path "$clientSrcPath\pages"
Create-DirectoryIfNotExists -Path "$clientSrcPath\hooks"
Create-DirectoryIfNotExists -Path "$clientSrcPath\services"
Create-DirectoryIfNotExists -Path "$clientSrcPath\contexts"
Create-DirectoryIfNotExists -Path "$clientSrcPath\utils"
Create-DirectoryIfNotExists -Path "$clientSrcPath\types"
Create-DirectoryIfNotExists -Path "$clientSrcPath\assets"
Create-DirectoryIfNotExists -Path "$clientSrcPath\styles"

# Create page files
Create-FileIfNotExists -Path "$clientSrcPath\pages\LoginPage.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\pages\RegisterPage.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\pages\DashboardPage.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\pages\CalendarPage.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\pages\WeatherPage.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\pages\PlantsPage.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\pages\RecipesPage.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\pages\MaintenancePage.tsx"

# Create hook files
Create-FileIfNotExists -Path "$clientSrcPath\hooks\useAuth.ts"
Create-FileIfNotExists -Path "$clientSrcPath\hooks\useCalendar.ts"

# Create service files
Create-FileIfNotExists -Path "$clientSrcPath\services\api.service.ts"
Create-FileIfNotExists -Path "$clientSrcPath\services\auth.service.ts"
Create-FileIfNotExists -Path "$clientSrcPath\services\calendar.service.ts"
Create-FileIfNotExists -Path "$clientSrcPath\services\weather.service.ts"
Create-FileIfNotExists -Path "$clientSrcPath\services\plant.service.ts"
Create-FileIfNotExists -Path "$clientSrcPath\services\recipe.service.ts"

# Create context files
Create-FileIfNotExists -Path "$clientSrcPath\contexts\AuthContext.tsx"

# Create utility files
Create-FileIfNotExists -Path "$clientSrcPath\utils\dateUtils.ts"
Create-FileIfNotExists -Path "$clientSrcPath\utils\formatters.ts"

# Create type files
Create-FileIfNotExists -Path "$clientSrcPath\types\User.ts"
Create-FileIfNotExists -Path "$clientSrcPath\types\Event.ts"
Create-FileIfNotExists -Path "$clientSrcPath\types\Task.ts"

# Create asset files
Create-FileIfNotExists -Path "$clientSrcPath\assets\logo.png"

# Create style files
Create-FileIfNotExists -Path "$clientSrcPath\styles\globals.css"
Create-FileIfNotExists -Path "$clientSrcPath\styles\tailwind.config.ts"

# Create main client files
Create-FileIfNotExists -Path "$clientSrcPath\App.tsx"
Create-FileIfNotExists -Path "$clientSrcPath\main.tsx"

# Create client configuration files
Create-FileIfNotExists -Path "$baseDir\client\package.json"
Create-FileIfNotExists -Path "$baseDir\client\tsconfig.json"
Create-FileIfNotExists -Path "$baseDir\client\vite.config.ts"
Create-FileIfNotExists -Path "$baseDir\client\Dockerfile" -Content "# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [\"nginx\", \"-g\", \"daemon off;\"]"

# Create nginx.conf for client
Create-FileIfNotExists -Path "$baseDir\client\nginx.conf" -Content "server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files `$uri `$uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_cache_bypass `$http_upgrade;
    }
}"

# Create server directory structure
$serverSrcPath = "$baseDir\server\src"
Create-DirectoryIfNotExists -Path $serverSrcPath

# Server subdirectories
Create-DirectoryIfNotExists -Path "$serverSrcPath\routes"
Create-DirectoryIfNotExists -Path "$serverSrcPath\controllers"
Create-DirectoryIfNotExists -Path "$serverSrcPath\services"
Create-DirectoryIfNotExists -Path "$serverSrcPath\middleware"
Create-DirectoryIfNotExists -Path "$serverSrcPath\config"
Create-DirectoryIfNotExists -Path "$serverSrcPath\utils"
Create-DirectoryIfNotExists -Path "$serverSrcPath\types"

# Create main server files
Create-FileIfNotExists -Path "$serverSrcPath\index.ts"
Create-FileIfNotExists -Path "$serverSrcPath\app.ts"

# Create route files
Create-FileIfNotExists -Path "$serverSrcPath\routes\auth.routes.ts"
Create-FileIfNotExists -Path "$serverSrcPath\routes\calendar.routes.ts"
Create-FileIfNotExists -Path "$serverSrcPath\routes\weather.routes.ts"
Create-FileIfNotExists -Path "$serverSrcPath\routes\plants.routes.ts"
Create-FileIfNotExists -Path "$serverSrcPath\routes\recipes.routes.ts"
Create-FileIfNotExists -Path "$serverSrcPath\routes\maintenance.routes.ts"

# Create controller files
Create-FileIfNotExists -Path "$serverSrcPath\controllers\authController.ts"
Create-FileIfNotExists -Path "$serverSrcPath\controllers\calendarController.ts"
Create-FileIfNotExists -Path "$serverSrcPath\controllers\weatherController.ts"
Create-FileIfNotExists -Path "$serverSrcPath\controllers\plantController.ts"
Create-FileIfNotExists -Path "$serverSrcPath\controllers\recipeController.ts"
Create-FileIfNotExists -Path "$serverSrcPath\controllers\maintenanceController.ts"

# Create service files
Create-FileIfNotExists -Path "$serverSrcPath\services\authService.ts"
Create-FileIfNotExists -Path "$serverSrcPath\services\calendarService.ts"
Create-FileIfNotExists -Path "$serverSrcPath\services\weatherService.ts"
Create-FileIfNotExists -Path "$serverSrcPath\services\plantService.ts"
Create-FileIfNotExists -Path "$serverSrcPath\services\recipeService.ts"
Create-FileIfNotExists -Path "$serverSrcPath\services\maintenanceService.ts"

# Create middleware files
Create-FileIfNotExists -Path "$serverSrcPath\middleware\authMiddleware.ts"
Create-FileIfNotExists -Path "$serverSrcPath\middleware\rateLimit.ts"
Create-FileIfNotExists -Path "$serverSrcPath\middleware\errorHandler.ts"
Create-FileIfNotExists -Path "$serverSrcPath\middleware\validator.ts"

# Create config files
Create-FileIfNotExists -Path "$serverSrcPath\config\config.ts"
Create-FileIfNotExists -Path "$serverSrcPath\config\redis.ts"
Create-FileIfNotExists -Path "$serverSrcPath\config\database.ts"

# Create utility files
Create-FileIfNotExists -Path "$serverSrcPath\utils\jwtUtils.ts"
Create-FileIfNotExists -Path "$serverSrcPath\utils\logger.ts"
Create-FileIfNotExists -Path "$serverSrcPath\utils\responseFormatter.ts"

# Create type files
Create-FileIfNotExists -Path "$serverSrcPath\types\RequestWithUser.ts"
Create-FileIfNotExists -Path "$serverSrcPath\types\index.ts"

# Create server configuration files
Create-FileIfNotExists -Path "$baseDir\server\package.json"
Create-FileIfNotExists -Path "$baseDir\server\tsconfig.json"
Create-FileIfNotExists -Path "$baseDir\server\.env"
Create-FileIfNotExists -Path "$baseDir\server\Dockerfile" -Content "FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD [\"node\", \"dist/index.js\"]"

# Create Prisma directory structure
Create-FileIfNotExists -Path "$baseDir\prisma\schema.prisma" -Content "// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = \"prisma-client-js\"
}

datasource db {
  provider = \"postgresql\"
  url      = env(\"DATABASE_URL\")
}

// User model
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  firstName         String?
  lastName          String?
  profileImageUrl   String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  events            Event[]
  tasks             Task[]
  plants            Plant[]
  recipes           Recipe[]
  maintenanceTasks  MaintenanceTask[]
}

// Calendar event model
model Event {
  id          String    @id @default(uuid())
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime
  allDay      Boolean   @default(false)
  location    String?
  category    String?
  color       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Task model
model Task {
  id          String    @id @default(uuid())
  title       String
  description String?
  dueDate     DateTime?
  priority    String?   // Low, Medium, High
  status      String    // Todo, InProgress, Done
  category    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Plant model
model Plant {
  id              String    @id @default(uuid())
  name            String
  species         String?
  image           String?
  wateringSchedule String?
  lastWatered     DateTime?
  fertilizeSchedule String?
  lastFertilized  DateTime?
  location        String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Recipe model
model Recipe {
  id              String    @id @default(uuid())
  title           String
  description     String?
  ingredients     Json      // Array of ingredients
  instructions    String
  prepTime        Int?      // In minutes
  cookTime        Int?      // In minutes
  servings        Int?
  imageUrl        String?
  tags            String[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Maintenance task model
model MaintenanceTask {
  id              String    @id @default(uuid())
  title           String
  description     String?
  dueDate         DateTime?
  completedDate   DateTime?
  frequency       String?   // One-time, Daily, Weekly, Monthly, etc.
  category        String?   // HVAC, Plumbing, Electrical, etc.
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}"

Create-DirectoryIfNotExists -Path "$baseDir\prisma\migrations"
Create-FileIfNotExists -Path "$baseDir\prisma\migrations\.gitkeep"

# Create GitHub Actions workflow
Create-DirectoryIfNotExists -Path "$baseDir\.github\workflows"
Create-FileIfNotExists -Path "$baseDir\.github\workflows\ci.yml" -Content "name: CI

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: |
        npm ci --prefix client
        npm ci --prefix server

    - name: Lint
      run: |
        npm run lint --prefix client
        npm run lint --prefix server

  build:
    runs-on: ubuntu-latest
    needs: lint
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: |
        npm ci --prefix client
        npm ci --prefix server

    - name: Build
      run: |
        npm run build --prefix client
        npm run build --prefix server

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: |
        npm ci --prefix client
        npm ci --prefix server

    - name: Test
      run: |
        npm run test --prefix client
        npm run test --prefix server"

# Create architecture.md with properly escaped PowerShell content
$architectureContent = @"
# BeckDash Architecture

## Overview

BeckDash follows a modern web application architecture with a clear separation between frontend and backend components. This document outlines the high-level architecture and design decisions.

## Frontend Architecture

The frontend is built using React with TypeScript and follows a component-based architecture:

* Component Structure: Organized by feature area (calendar, weather, plants, etc.)
* State Management: Uses React Context API for global state with potential to scale to Redux/Zustand
* Routing: Implemented with React Router for navigation between different sections
* Styling: Utilizes Tailwind CSS with Shadcn UI components for a consistent design system

## Backend Architecture

The backend follows a layered architecture pattern:

* API Layer: Express routes that define the API endpoints
* Controller Layer: Handles request/response logic
* Service Layer: Contains business logic
* Data Access Layer: Prisma ORM for database interactions

## Database Design

The application uses PostgreSQL with the following key entities:

* Users
* Events
* Tasks
* Plants
* Recipes
* Maintenance Tasks

## Authentication and Security

* JWT-based authentication with refresh tokens
* HTTP-only cookies for secure token storage
* Role-based access control for authorization
* Rate limiting to prevent abuse

## Deployment Architecture

* Docker containers for consistent environments
* Railway for cloud hosting
* GitHub Actions for CI/CD pipelines
"@

Create-FileIfNotExists -Path "$baseDir\docs\architecture.md" -Content $architectureContent

# Create API documentation with properly escaped content
$apiDocContent = @"
# BeckDash API Documentation

## Base URL

All API endpoints are prefixed with `/api/v1`

## Authentication

### Register a new user

**POST** `/api/v1/auth/register`

**Request Body**:
```json
{
  \"email\": \"user@example.com\",
  \"password\": \"securepassword\",
  \"firstName\": \"John\",
  \"lastName\": \"Doe\"
}
```

### Login

**POST** `/api/v1/auth/login`

**Request Body**:
```json
{
  \"email\": \"user@example.com\",
  \"password\": \"securepassword\"
}
```

### Refresh Token

**POST** `/api/v1/auth/refresh-token`

## Calendar API

### Get Events

**GET** `/api/v1/calendar/events?startDate=2023-01-01&endDate=2023-01-31`

### Create Event

**POST** `/api/v1/calendar/events`

**Request Body**:
```json
{
  \"title\": \"Team Meeting\",
  \"description\": \"Weekly team sync\",
  \"startDate\": \"2023-01-15T10:00:00Z\",
  \"endDate\": \"2023-01-15T11:00:00Z\",
  \"allDay\": false,
  \"category\": \"work\"
}
```

## Weather API

### Get Current Weather

**GET** `/api/v1/weather/current?location=NewYork`

### Get Forecast

**GET** `/api/v1/weather/forecast?location=NewYork&days=5`

## Plant Care API

### Get Plants

**GET** `/api/v1/plants`

### Create Plant

**POST** `/api/v1/plants`

**Request Body**:
```json
{
  \"name\": \"Snake Plant\",
  \"species\": \"Sansevieria trifasciata\",
  \"wateringSchedule\": \"Every 2 weeks\",
  \"location\": \"Living Room\"
}
```

## Recipe API

### Get Recipes

**GET** `/api/v1/recipes?tags=dinner,vegetarian`

### Create Recipe

**POST** `/api/v1/recipes`

**Request Body**:
```json
{
  \"title\": \"Vegetable Stir Fry\",
  \"description\": \"Quick healthy dinner\",
  \"ingredients\": [
    {\"name\": \"Bell Pepper\", \"amount\": \"1\", \"unit\": \"whole\"},
    {\"name\": \"Broccoli\", \"amount\": \"2\", \"unit\": \"cups\"}
  ],
  \"instructions\": \"1. Heat oil in a wok...\",
  \"prepTime\": 10,
  \"cookTime\": 15,
  \"servings\": 2,
  \"tags\": [\"dinner\", \"vegetarian\", \"quick\"]
}
```

## Maintenance API

### Get Maintenance Tasks

**GET** `/api/v1/maintenance?status=pending`

### Create Maintenance Task

**POST** `/api/v1/maintenance`

**Request Body**:
```json
{
  \"title\": \"Change HVAC Filter\",
  \"description\": \"Replace with MERV 13 filter\",
  \"dueDate\": \"2023-02-01\",
  \"frequency\": \"Monthly\",
  \"category\": \"HVAC\"
}
```
"@

Create-FileIfNotExists -Path "$baseDir\docs\api-documentation.md" -Content $apiDocContent

# Create development guide with properly escaped content
$devGuideContent = @"
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
   ```
   git clone https://github.com/yourusername/beckdash.git
   cd beckdash
   ```

2. Install dependencies:
   ```
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Configure environment variables:
   ```
   # Copy the example .env file
   cp .env.example .env
   # Edit .env with your own values
   ```

## Development Environment

### Using Docker Compose

The easiest way to set up all required services:

```
docker-compose up -d
```

This will start:
* PostgreSQL database
* Redis cache
* Backend API server
* Frontend development server

### Running Locally

#### Backend

```
cd server
npm run dev
```

#### Frontend

```
cd client
npm run dev
```

## Database Management

### Migrations

Create a new migration after schema changes:

```
npx prisma migrate dev --name <descriptive_name>
```

Apply migrations:

```
npx prisma migrate deploy
```

### Database Studio

Visualize and edit your database:

```
npx prisma studio
```

## Code Quality

### Linting

```
# In client directory
npm run lint

# In server directory
npm run lint
```

### Testing

```
# In client directory
npm run test

# In server directory
npm run test
```

## Building for Production

### Backend

```
cd server
npm run build
```

### Frontend

```
cd client
npm run build
```

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
* Check server logs: `docker-compose logs backend`
* Verify API endpoints match documentation

#### Frontend Build Errors
* Clear node_modules: `rm -rf node_modules && npm install`
* Check for TypeScript errors: `npm run type-check`
"@

Create-FileIfNotExists -Path "$baseDir\docs\development-guide.md" -Content $devGuideContent

# Create contributing guide with properly escaped content
$contributingContent = @"
# Contributing to BeckDash

Thank you for considering contributing to BeckDash! This document outlines the process for contributing to the project.

## Code of Conduct

We have a code of conduct that we expect all contributors to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

* Use the issue tracker to report bugs
* Check existing issues to avoid duplicates
* Include detailed steps to reproduce the bug
* Specify your operating system and browser

### Suggesting Enhancements

* Use the issue tracker with the \"enhancement\" label
* Provide a clear and detailed explanation
* Include examples of how the feature would work
* Explain why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure they pass
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Workflow

1. Pick an issue to work on
2. Comment on the issue to let others know you're working on it
3. Create a branch with a descriptive name
4. Make your changes
5. Write tests for your changes
6. Ensure all tests pass
7. Submit a pull request

## Coding Standards

* Use TypeScript for all code
* Follow the existing code style and formatting
* Write meaningful commit messages
* Add appropriate comments and documentation
* Write tests for new features

## Review Process

* All submissions require review
* Maintainers will review pull requests
* Feedback must be addressed before merging
* Changes may be requested to better match the project goals

## Getting Help

If you need help with the contribution process, feel free to:

* Comment on the relevant issue
* Join our community chat/forum (coming soon)
* Contact the maintainers directly

Thank you for contributing to BeckDash!
"@

Create-FileIfNotExists -Path "$baseDir\docs\contributing.md" -Content $contributingContent

# Output completion message
Write-Host "`nBeckDash project structure created successfully!`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Initialize git repository: git init" -ForegroundColor White
Write-Host "2. Install frontend dependencies: cd client && npm install" -ForegroundColor White
Write-Host "3. Install backend dependencies: cd server && npm install" -ForegroundColor White
Write-Host "4. Install Prisma client: npx prisma generate" -ForegroundColor White
Write-Host "5. Start development server: docker-compose up" -ForegroundColor White