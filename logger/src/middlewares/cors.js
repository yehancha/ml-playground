const cors = require('cors');

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3010'];

module.exports.useCors = app => {
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));
}