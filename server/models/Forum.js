const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true
  },
  messages: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    displayName: String,
    role: String,
    text: {
      type: String,
      required: true
    },
    image: String,
    replies: [{
      user: mongoose.Schema.Types.ObjectId,
      username: String,
      displayName: String,
      text: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    likes: [mongoose.Schema.Types.ObjectId],
    isPinned: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Forum', forumSchema);
