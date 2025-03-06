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
