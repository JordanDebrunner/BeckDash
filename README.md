# BeckDash: A Comprehensive Home Management Platform

BeckDash is a unified, scalable, and highly customizable home management system designed to streamline daily household tasks, integrate essential services, and provide an intuitive, user-friendly experience.

## 🌟 Core Features

### 📅 Calendar & Scheduling Hub
- Task & Event Scheduling
- Reminders & Notifications
- Recurring Tasks Support
- Task Prioritization & Categorization
- Weather Integration

### 🌦️ Weather Dashboard
- Current & Forecast Data
- Severe Weather Alerts
- Smart Recommendations

### 🪴 Plant Care & Gardening Assistant
- Plant Profiles
- Automated Care Reminders
- Seasonal Adjustments

### 🥗 Recipe & Meal Planning System
- Personal Recipe Book
- Ingredient Inventory Management
- Automated Shopping List
- Nutritional Information Integration

### 🔧 Home Maintenance & Chore Manager
- Maintenance Logs
- Chore Assignments
- Home Improvement Tracking

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- React Router for navigation

### Backend
- Node.js + Express
- JWT Authentication
- Redis for caching
- PostgreSQL database with Prisma ORM

### DevOps
- Docker for containerization
- GitHub Actions for CI/CD
- Railway for cloud hosting

## Getting Started

### Prerequisites
- Node.js (v16+)
- Docker and Docker Compose
- Git

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/beckdash.git
   cd beckdash
   ```

2. Install dependencies:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Copy the example .env file
   cp .env.example .env
   # Edit .env with your own values
   ```

4. Start development environment:
   ```bash
   docker-compose up -d
   ```

5. Initialize database:
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```

6. Start development servers:
   ```bash
   # In client directory
   cd ../client
   npm run dev

   # In server directory (in another terminal)
   cd ../server
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5173`

## Project Structure

The project follows a modular architecture with clear separation of concerns:

- `/client`: Frontend React application
- `/server`: Backend Express API
- `/prisma`: Database schema and migrations
- `/docs`: Project documentation

## Feature Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication | ✅ Complete | Login, registration, profile management |
| Calendar | ✅ Complete | Event management, recurring events |
| Weather Dashboard | ✅ Complete | Current conditions, forecasts |
| Plant Care | ✅ Complete | Plant profiles, watering schedules |
| Recipes | ✅ Complete | Recipe storage, categorization |
| Maintenance | ✅ Complete | Task tracking, reminders |
| Smart Home Integration | 🔄 Planned | Coming in future update |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Docker](https://www.docker.com/)