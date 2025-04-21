const express = require('express');
const logRoutes = require('./src/routes/logRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const { useCors } = require('./src/middlewares/cors');
const { useLogger } = require('./src/middlewares/requestLogger');

const app = express();
const port = process.env.LOGGER_PORT;

// Use middleware
useCors(app);
app.use(express.json());
useLogger(app);

// Attach routes
logRoutes.attach(app);
healthRoutes.attach(app);

app.listen(port, () => {
  console.log(`Logger service listening at http://localhost:${port}`);
});
