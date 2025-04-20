const express = require('express');
const cors = require('cors');
const app = express();
const port = 3010;

const allowedOrigins = ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

app.post('/api/prompt', (req, res) => {
  const userMessage = req.body.content || 'No message received';
  const conversationHistory = req.body.conversationHistory || [];
  
  res.json({ 
    actor: 'model',
    content: `You said: "${userMessage}" - Hello from the Backend!` 
  });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
