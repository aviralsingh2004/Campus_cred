const { createEventTables } = require('./createEventTables');
const { seedEvents } = require('./seedEvents');

const setupEvents = async () => {
  try {
    console.log('🚀 Setting up events system...');
    
    // Create tables
    await createEventTables();
    
    // Seed sample data
    await seedEvents();
    
    console.log('✅ Events system setup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up events system:', error);
    process.exit(1);
  }
};

setupEvents();
