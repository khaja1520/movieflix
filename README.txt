# MovieFlix Dashboard

A comprehensive movie dashboard application built with React.js frontend and Node.js backend, featuring movie search, data visualization, and analytics. The application integrates with the OMDb API to fetch movie data, caches it locally for efficient retrieval, and provides interactive charts and filtering capabilities.

## Features

### ðŸŽ¬ Core Features
- **Movie Search**: Search for movies using OMDb API integration
- **Detailed Movie Information**: View comprehensive movie details including cast, plot, ratings
- **Advanced Filtering**: Filter movies by genre, year, rating, and other criteria
- **Sorting Options**: Sort results by rating, year, runtime, and title
- **Data Visualization**: Interactive charts showing genre distribution, ratings analysis, and runtime trends
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### ðŸ”’ Authentication & Security
- JWT-based authentication system
- Protected admin routes for data management
- Role-based access control

### ðŸ“Š Analytics Dashboard
- **Genre Distribution**: Pie chart showing movie genres breakdown
- **Average Ratings by Genre**: Bar chart analyzing ratings across genres
- **Runtime Trends**: Line chart displaying average runtime by release year
- **Movie Statistics**: Aggregate data and insights

### ðŸš€ Additional Features
- **Caching System**: Local database caching to reduce API calls
- **Pagination**: Efficient handling of large datasets
- **Dark/Light Theme**: Toggle between themes
- **CSV Export**: Download movie data in CSV format
- **Error Handling**: Graceful error management with user-friendly messages

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Axios** - HTTP client for API calls
- **Chart.js** - Data visualization
- **Tailwind CSS** - Styling framework
- **React Router** - Navigation
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware

### APIs & Services
- **OMDb API** - Movie data source
- **MongoDB Atlas** - Cloud database (for deployment)

## Project Structure

```
movieflix-dashboard/
â”œâ”€â”€ README.md
â”œâ”€â”€ package.json
â”œâ”€â”€ .env.example
â”œâ”€â”€ .gitignore
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ Auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ Dashboard/
â”‚   â”‚   â”‚   â”œâ”€â”€ Charts/
â”‚   â”‚   â”‚   â”œâ”€â”€ Layout/
â”‚   â”‚   â”‚   â””â”€â”€ Common/
â”‚   â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”œâ”€â”€ contexts/
â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â””â”€â”€ styles/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ package.json
â”‚   â”œâ”€â”€ server.js
â”‚   â”œâ”€â”€ config/
â”‚   â”œâ”€â”€ models/
â”‚   â”œâ”€â”€ routes/
â”‚   â”œâ”€â”€ controllers/
â”‚   â”œâ”€â”€ middleware/
â”‚   â”œâ”€â”€ services/
â”‚   â””â”€â”€ utils/
â””â”€â”€ docs/
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- OMDb API key (free from http://www.omdbapi.com/apikey.aspx)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/movieflix-dashboard.git
cd movieflix-dashboard
```

### 2. Environment Configuration
Create a `.env` file in the root directory using the example below:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/movieflix
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/movieflix

# API Keys
OMDB_API_KEY=your_omdb_api_key_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Cache Configuration
CACHE_EXPIRY_HOURS=24
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the backend server
npm run dev
```

The backend server will start on http://localhost:5000

### 4. Frontend Setup
```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```

The frontend application will start on http://localhost:3000

### 5. Database Setup
- **Local MongoDB**: Ensure MongoDB is running on your system
- **MongoDB Atlas**: Create a cluster and update the MONGODB_URI in .env file

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Movies
- `GET /api/movies` - Search movies with query parameters
  - `?search=movie_title` - Search by title
  - `?sort=rating` - Sort by field (rating, year, title)
  - `?filter=genre:Action` - Filter by genre
  - `?page=1&limit=10` - Pagination
- `GET /api/movies/:id` - Get movie details by ID
- `POST /api/movies/refresh` - Refresh cache (admin only)

### Statistics
- `GET /api/stats/genres` - Genre distribution data
- `GET /api/stats/ratings` - Average ratings by genre
- `GET /api/stats/runtime` - Runtime trends by year
- `GET /api/stats/overview` - General statistics overview

## Usage Guide

### 1. Getting Started
1. Register for a new account or use demo credentials
2. Use the search bar to find movies
3. Apply filters and sorting as needed
4. Click on movie cards to view detailed information

### 2. Admin Features
- Login with admin credentials to access:
  - Cache management
  - Data refresh capabilities
  - Advanced statistics

### 3. Data Visualization
- Navigate to the Stats page to view:
  - Interactive charts and graphs
  - Aggregate data insights
  - Export functionality

## Deployment

### Vercel Deployment (Recommended for Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Heroku Deployment (Backend)
```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create movieflix-api

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set OMDB_API_KEY=your_api_key
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git subtree push --prefix backend heroku main
```

### Railway Deployment (Full Stack)
```bash
# Connect your GitHub repository to Railway
# Set environment variables in Railway dashboard
# Deploy with automatic builds
```

## Environment Variables

### Required Variables
- `OMDB_API_KEY`: Your OMDb API key for fetching movie data
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation

### Optional Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `CACHE_EXPIRY_HOURS`: Cache expiration time (default: 24 hours)
- `FRONTEND_URL`: Frontend URL for CORS configuration

## Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run test       # Run tests
npm run lint       # Run ESLint
```

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm run test       # Run tests
npm run eject      # Eject from Create React App
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

## Acknowledgments

- [OMDb API](http://www.omdbapi.com/) for providing movie data
- [React.js](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework
- [Chart.js](https://www.chartjs.org/) for data visualization

---

**Live Demo**: [Your Deployed App URL]
**API Documentation**: [Your API Docs URL]