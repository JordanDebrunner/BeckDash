# BeckDash API Documentation

## Base URL

All API endpoints are prefixed with /api/v1

## Authentication

### Register a new user

**POST** /api/v1/auth/register

**Request Body**:
`json
{
  \"email\": \"user@example.com\",
  \"password\": \"securepassword\",
  \"firstName\": \"John\",
  \"lastName\": \"Doe\"
}
`

### Login

**POST** /api/v1/auth/login

**Request Body**:
`json
{
  \"email\": \"user@example.com\",
  \"password\": \"securepassword\"
}
`

### Refresh Token

**POST** /api/v1/auth/refresh-token

## Calendar API

### Get Events

**GET** /api/v1/calendar/events?startDate=2023-01-01&endDate=2023-01-31

### Create Event

**POST** /api/v1/calendar/events

**Request Body**:
`json
{
  \"title\": \"Team Meeting\",
  \"description\": \"Weekly team sync\",
  \"startDate\": \"2023-01-15T10:00:00Z\",
  \"endDate\": \"2023-01-15T11:00:00Z\",
  \"allDay\": false,
  \"category\": \"work\"
}
`

## Weather API

### Get Current Weather

**GET** /api/v1/weather/current?location=NewYork

### Get Forecast

**GET** /api/v1/weather/forecast?location=NewYork&days=5

## Plant Care API

### Get Plants

**GET** /api/v1/plants

### Create Plant

**POST** /api/v1/plants

**Request Body**:
`json
{
  \"name\": \"Snake Plant\",
  \"species\": \"Sansevieria trifasciata\",
  \"wateringSchedule\": \"Every 2 weeks\",
  \"location\": \"Living Room\"
}
`

## Recipe API

### Get Recipes

**GET** /api/v1/recipes?tags=dinner,vegetarian

### Create Recipe

**POST** /api/v1/recipes

**Request Body**:
`json
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
`

## Maintenance API

### Get Maintenance Tasks

**GET** /api/v1/maintenance?status=pending

### Create Maintenance Task

**POST** /api/v1/maintenance

**Request Body**:
`json
{
  \"title\": \"Change HVAC Filter\",
  \"description\": \"Replace with MERV 13 filter\",
  \"dueDate\": \"2023-02-01\",
  \"frequency\": \"Monthly\",
  \"category\": \"HVAC\"
}
`
