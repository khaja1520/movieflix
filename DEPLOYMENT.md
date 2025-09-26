# Deployment Guide

## Overview

This guide covers deploying the MovieFlix Dashboard to various cloud platforms. The application consists of:
- **Frontend**: React.js application
- **Backend**: Node.js/Express API
- **Database**: MongoDB

## Prerequisites

- Git repository with your code
- API keys and environment variables ready
- MongoDB Atlas account (for cloud database)

## Platform Options

### 1. Vercel (Recommended for Frontend)

**Best for**: Frontend deployment with serverless functions

#### Frontend Deployment to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Prepare Frontend**
```bash
cd frontend
# Create vercel.json configuration
```

Create `frontend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": { "cache-control": "s-maxage=31536000,immutable" },
      "dest": "/static/$1"
    },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "env": {
    "REACT_APP_API_URL": "@api_url"
  }
}
```

3. **Deploy Frontend**
```bash
vercel --prod
```

4. **Set Environment Variables**
```bash
vercel env add REACT_APP_API_URL
# Enter your backend API URL
```

### 2. Railway (Recommended for Full Stack)

**Best for**: Full-stack deployment with automatic deployments

#### Setup Railway Deployment

1. **Connect GitHub Repository**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub account
   - Import your repository

2. **Configure Backend Service**
   - Create new service from GitHub repo
   - Set root directory to `/backend`
   - Railway will auto-detect Node.js

3. **Set Environment Variables**
```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movieflix
OMDB_API_KEY=your_omdb_api_key
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=https://your-frontend-domain.vercel.app
CACHE_EXPIRY_HOURS=24
```

4. **Configure Frontend Service**
   - Create another service for frontend
   - Set root directory to `/frontend`
   - Set environment variable: `REACT_APP_API_URL=https://your-backend-domain.railway.app/api`

### 3. Heroku (Traditional PaaS)

#### Backend Deployment to Heroku

1. **Install Heroku CLI**
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login and Create App**
```bash
heroku login
heroku create movieflix-api
```

3. **Configure Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movieflix
heroku config:set OMDB_API_KEY=your_omdb_api_key
heroku config:set JWT_SECRET=your_super_secret_jwt_key
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
```

4. **Deploy Backend**
```bash
# From root directory
git subtree push --prefix backend heroku main
```

5. **Set up Procfile** (create `backend/Procfile`):
```
web: node server.js
```

#### Frontend to Netlify

1. **Build and Deploy**
```bash
cd frontend
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

2. **Set Environment Variables** in Netlify dashboard:
```
REACT_APP_API_URL=https://your-heroku-app.herokuapp.com/api
```

### 4. Digital Ocean App Platform

#### Full Stack Deployment

1. **Create App Spec** (`.do/app.yaml`):
```yaml
name: movieflix-dashboard
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/movieflix-dashboard
    branch: main
  run_command: node server.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${mongodb_uri}
  - key: OMDB_API_KEY
    value: ${omdb_api_key}
  - key: JWT_SECRET
    value: ${jwt_secret}
  http_port: 5000

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/movieflix-dashboard
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: REACT_APP_API_URL
    value: ${backend_url}/api
```

## Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster

1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a new project** and cluster
3. **Configure network access**: Add `0.0.0.0/0` for all IPs (or specific IPs)
4. **Create database user** with read/write permissions
5. **Get connection string**: `mongodb+srv://username:password@cluster.mongodb.net/movieflix`

### 2. Database Security

```javascript
// Add to your backend startup
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB Atlas');
});
```

## Environment Variables Reference

### Backend Environment Variables
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movieflix

# External APIs
OMDB_API_KEY=your_omdb_api_key

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Cache
CACHE_EXPIRY_HOURS=24
```

### Frontend Environment Variables
```env
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Custom Domain Setup

### Vercel Custom Domain
1. Go to project settings in Vercel dashboard
2. Add custom domain
3. Configure DNS records as instructed

### Railway Custom Domain
1. Go to service settings
2. Add custom domain under "Networking"
3. Configure CNAME record

## SSL/HTTPS

All recommended platforms provide automatic SSL certificates:
- **Vercel**: Automatic SSL with Let's Encrypt
- **Railway**: Automatic SSL
- **Heroku**: Automatic SSL for custom domains
- **Netlify**: Automatic SSL

## Performance Optimization

### Frontend Optimization

1. **Build Optimization**
```bash
# In frontend directory
npm run build

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

2. **Caching Headers** (Vercel):
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Backend Optimization

1. **Enable Compression** (already included):
```javascript
app.use(compression());
```

2. **Database Indexing** (already configured in models):
```javascript
movieSchema.index({ title: 'text', plot: 'text' });
movieSchema.index({ genre: 1, year: 1 });
```

## Monitoring and Logging

### Application Monitoring

1. **Add Health Check Endpoint** (already included):
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

2. **Error Logging**:
```javascript
// Production error handling
if (process.env.NODE_ENV === 'production') {
  // Use services like Sentry, LogRocket, or platform-specific logging
}
```

### Database Monitoring

- **MongoDB Atlas**: Built-in monitoring dashboard
- **Connection Pool Monitoring**:
```javascript
mongoose.connection.on('error', console.error);
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

## Backup and Recovery

### Database Backup
1. **MongoDB Atlas**: Automatic backups enabled by default
2. **Manual Backup**:
```bash
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/movieflix"
```

### Code Backup
- **Git Repository**: Ensure all code is committed and pushed
- **Environment Variables**: Keep secure backup of all environment variables

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster created and connected
- [ ] OMDb API key obtained and configured
- [ ] CORS settings configured for production domain
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate verified
- [ ] Health check endpoint responding
- [ ] Database connection successful
- [ ] Frontend can communicate with backend
- [ ] Authentication flow working
- [ ] File uploads/downloads working (if applicable)
- [ ] Error pages configured
- [ ] Monitoring/logging set up

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` is set correctly in backend
   - Check browser network tab for actual error

2. **Database Connection**:
   - Verify MongoDB URI format
   - Check network access settings in Atlas
   - Ensure database user has correct permissions

3. **API Key Issues**:
   - Verify OMDb API key is active
   - Check API usage limits

4. **Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify variables are available at runtime

### Debug Commands

```bash
# Check backend health
curl https://your-backend-domain.com/api/health

# Check environment variables (development only)
node -e "console.log(process.env)"

# Test database connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('DB OK'))"
```

## Scaling Considerations

### Horizontal Scaling
- **Load Balancers**: Use platform-provided load balancing
- **Database**: MongoDB Atlas auto-scaling
- **Caching**: Implement Redis for session storage

### Vertical Scaling
- **Instance Size**: Monitor CPU/memory usage and upgrade as needed
- **Database Tier**: Upgrade MongoDB Atlas tier for better performance

This deployment guide provides multiple options for hosting your MovieFlix Dashboard. Choose the platform that best fits your needs, budget, and technical requirements.