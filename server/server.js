require('dotenv').config();
const app = require('./src/app');

// Read the port from environment variables, fall back to 5000
const PORT = process.env.PORT || 5000;

// Connect to the database and then start listening for requests
const { sequelize } = require('./src/models');

const startServer = async () => {
  try {
    // Verify that we can actually reach the database before accepting requests
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync models with the database — in development, alter:true keeps the schema up to date
    // without destroying existing data
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
