const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'message' }]

},{timestamps:true});

const ConversationModel = mongoose.model('Conversation', conversationSchema);

module.exports = ConversationModel;
