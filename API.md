# API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-app-domain.com/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Auth Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token"
  }
}
```

#### Get User Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Movies Endpoints

#### Search Movies
```http
GET /movies?search=batman&sort=rating&filter=genre:Action&page=1&limit=10&year=2022&type=movie
```

**Query Parameters:**
- `search` (string): Search term for movie titles
- `sort` (string): Sort by `rating`, `year`, `title`, `popularity`, or `relevance` (default)
- `filter` (string): Filter by genre format: `genre:Action`
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 10, max: 50)
- `year` (number): Filter by release year
- `type` (string): Filter by type: `movie`, `series`, `episode`, or `all`

**Response:**
```json
{
  "success": true,
  "data": {
    "movies": [
      {
        "id": "movie_id",
        "imdbID": "tt0372784",
        "title": "Batman Begins",
        "year": 2005,
        "genre": ["Action", "Adventure"],
        "director": "Christopher Nolan",
        "actors": ["Christian Bale", "Michael Caine"],
        "plot": "Movie plot...",
        "imdbRating": 8.2,
        "runtime": "140 min",
        "poster": "https://...",
        "type": "movie"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

#### Get Movie Details
```http
GET /movies/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "movie_id",
    "imdbID": "tt0372784",
    "title": "Batman Begins",
    "year": 2005,
    "rated": "PG-13",
    "released": "2005-06-15T00:00:00.000Z",
    "runtime": "140 min",
    "runtimeMinutes": 140,
    "genre": ["Action", "Adventure"],
    "director": "Christopher Nolan",
    "writer": "Bob Kane, David S. Goyer",
    "actors": ["Christian Bale", "Michael Caine"],
    "plot": "Detailed plot...",
    "language": ["English"],
    "country": ["USA", "UK"],
    "awards": "Nominated for 1 Oscar...",
    "poster": "https://...",
    "ratings": [
      {
        "source": "Internet Movie Database",
        "value": "8.2/10"
      }
    ],
    "imdbRating": 8.2,
    "imdbVotes": "1,300,000",
    "type": "movie",
    "boxOffice": "$206,852,432",
    "website": "https://...",
    "popularity": 95,
    "searchCount": 1250
  }
}
```

#### Get Popular Movies
```http
GET /movies/popular?limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      // Movie objects (same structure as search results)
    }
  ]
}
```

#### Export Movies CSV
```http
GET /movies/export/csv?search=batman&filter=genre:Action
```

**Response:** CSV file download

#### Refresh Movie Cache (Admin)
```http
POST /movies/:id/refresh
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Movie cache refreshed successfully",
  "data": {
    // Updated movie object
  }
}
```

#### Clear Expired Cache (Admin)
```http
DELETE /movies/cache/expired
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cleared 25 expired cache entries"
}
```

## Statistics Endpoints

#### Get Genre Statistics
```http
GET /stats/genres
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "genre": "Action",
      "count": 150,
      "percentage": 25.5
    },
    {
      "genre": "Comedy",
      "count": 120,
      "percentage": 20.4
    }
  ]
}
```

#### Get Rating Statistics
```http
GET /stats/ratings
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "genre": "Action",
      "averageRating": 7.2,
      "movieCount": 150
    },
    {
      "genre": "Comedy",
      "averageRating": 6.8,
      "movieCount": 120
    }
  ]
}
```

#### Get Runtime Statistics
```http
GET /stats/runtime
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "year": 2023,
      "averageRuntime": 125,
      "movieCount": 45
    },
    {
      "year": 2022,
      "averageRuntime": 118,
      "movieCount": 52
    }
  ]
}
```

#### Get Overview Statistics
```http
GET /stats/overview
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMovies": 1500,
    "totalGenres": 25,
    "averageRating": 7.1,
    "totalSearches": 15000,
    "cacheHitRate": 85.5,
    "lastUpdated": "2023-12-01T10:30:00.000Z"
  }
}
```

## Health Check

#### API Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "MovieFlix API is running",
  "timestamp": "2023-12-01T10:30:00.000Z"
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to:
- **100 requests per 15 minutes** per IP address
- **1000 requests per hour** for authenticated users

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Data Models

### Movie Model
```typescript
interface Movie {
  id: string;
  imdbID: string;
  title: string;
  year: number;
  rated?: string;
  released?: Date;
  runtime?: string;
  runtimeMinutes?: number;
  genre: string[];
  director?: string;
  writer?: string;
  actors: string[];
  plot?: string;
  language: string[];
  country: string[];
  awards?: string;
  poster?: string;
  ratings: Rating[];
  imdbRating?: number;
  imdbVotes?: string;
  type: 'movie' | 'series' | 'episode';
  dvd?: Date;
  boxOffice?: string;
  production?: string;
  website?: string;
  popularity: number;
  searchCount: number;
  lastFetched: Date;
  cacheExpiry: Date;
}
```

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### Rating Model
```typescript
interface Rating {
  source: string;
  value: string;
}
```