const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Event = require('./Event');

const EventRegistration = sequelize.define('EventRegistration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Event,
      key: 'id'
    }
  },
  registration_status: {
    type: DataTypes.ENUM('registered', 'attended', 'cancelled'),
    defaultValue: 'registered'
  },
  points_awarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  attended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'event_registrations',
  timestamps: true,
  createdAt: 'registered_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'event_id']
    }
  ]
});

// Define associations
EventRegistration.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
EventRegistration.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });
User.hasMany(EventRegistration, { foreignKey: 'user_id', as: 'eventRegistrations' });
Event.hasMany(EventRegistration, { foreignKey: 'event_id', as: 'registrations' });

module.exports = EventRegistration;
