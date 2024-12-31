const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    stats: {
        kicks: { type: Number, default: 0 },
        bans: { type: Number, default: 0 },
        channelChanges: { type: Number, default: 0 },
        roleChanges: { type: Number, default: 0 },
        messageDeletes: { type: Number, default: 0 },
        messageEdits: { type: Number, default: 0 },
        memberUpdates: { type: Number, default: 0 },
        serverUpdates: { type: Number, default: 0 }
    },
    lastReset: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stats', statsSchema); 