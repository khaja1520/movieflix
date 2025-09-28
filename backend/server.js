require('dotenv').config();
console.log('OMDB_API_KEY:', process.env.OMDB_API_KEY);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const moviesRouter = require('./routes/movies');
const statsRouter = require('./routes/stats');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/movies', moviesRouter);
app.use('/api/stats', statsRouter); // NEW route for stats

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`API running on ${PORT}`));
})
.catch((err) => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1); // Exit app if cannot connect
});
