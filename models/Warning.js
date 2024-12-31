const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    expires: { type: Date },
    active: { type: Boolean, default: true }
});

warningSchema.index({ guildId: 1, userId: 1, timestamp: -1 });

module.exports = mongoose.model('Warning', warningSchema); 