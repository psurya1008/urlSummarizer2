require('dotenv').config();
const express = require('express');
const cors = require('cors');
const summarizeRoute = require('./summarize');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // You can restrict origin in production
app.use(express.json());

// Route for summarization
app.post('/api/summarize', summarizeRoute);

app.get('/', (req, res) => {
  res.send('Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
