module.exports.useLogger = app => {
  app.use((req, res, next) => {
    // We only log process requests
    if (!req.originalUrl.includes('/process/')) {
      next();
      return;
    }
  
    const startTime = new Date();
    const originalSend = res.send;
  
    res.send = function(body) {
      try {
        const logData = {
          timestamp: startTime.getTime(),
          endpoint: req.originalUrl,
          input: req.body,
          model: req.body.modelName,
          output: body,
          responseTimeMs: new Date() - startTime,
        };
  
        fetch(`${process.env.LOGGER_URL}/api/logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logData),
        }).then(response => {
          if (!response.ok) {
            console.error('Error sending log to logging service.', response.status);
          }
        });
      } catch (error) {
        console.error('Error sending log:', error);
      } finally {
        originalSend.call(this, body);
      }
    };
  
    next();
  });
}
