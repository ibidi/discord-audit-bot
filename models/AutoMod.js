const mongoose = require('mongoose');

const autoModSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    settings: {
        antiSpam: {
            enabled: { type: Boolean, default: false },
            maxMessages: { type: Number, default: 5 },
            interval: { type: Number, default: 5000 }, // ms
            action: { type: String, enum: ['warn', 'mute', 'kick', 'ban'], default: 'warn' }
        },
        antiLink: {
            enabled: { type: Boolean, default: false },
            whitelistedDomains: [String],
            action: { type: String, enum: ['warn', 'mute', 'kick', 'ban'], default: 'warn' }
        },
        badWords: {
            enabled: { type: Boolean, default: false },
            words: [String],
            action: { type: String, enum: ['warn', 'mute', 'kick', 'ban'], default: 'warn' }
        },
        raidProtection: {
            enabled: { type: Boolean, default: false },
            joinThreshold: { type: Number, default: 10 },
            timeWindow: { type: Number, default: 10000 }, // ms
            action: { type: String, enum: ['lockdown', 'kick'], default: 'lockdown' }
        },
        muteDuration: { type: Number, default: 3600000 } // 1 saat (ms)
    },
    ignoredChannels: [String],
    ignoredRoles: [String],
    logChannelId: { type: String }
});

module.exports = mongoose.model('AutoMod', autoModSchema); 