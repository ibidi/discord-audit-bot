const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    type: { type: String, required: true }, // 'roles', 'channels', 'settings'
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
    description: { type: String },
    createdBy: { type: String } // User ID
});

backupSchema.index({ guildId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Backup', backupSchema); 