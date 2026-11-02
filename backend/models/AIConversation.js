const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 1200 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AIConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIConversation', AIConversationSchema);
