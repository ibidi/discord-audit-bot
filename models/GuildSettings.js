const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannelId: { type: String, required: true },
    filters: {
        messages: { type: Boolean, default: true },
        members: { type: Boolean, default: true },
        voice: { type: Boolean, default: true },
        roles: { type: Boolean, default: true },
        channels: { type: Boolean, default: true },
        reactions: { type: Boolean, default: true },
        threads: { type: Boolean, default: true },
        invites: { type: Boolean, default: true },
        presence: { type: Boolean, default: false },
        webhooks: { type: Boolean, default: true },
        integrations: { type: Boolean, default: true },
        stage: { type: Boolean, default: true },
        stickers: { type: Boolean, default: true },
        events: { type: Boolean, default: true },
        error: { type: Boolean, default: true }
    },
    ignoredChannels: [String],
    ignoredRoles: [String],
    ignoredUsers: [String],
    logRetentionDays: { type: Number, default: 30 },
    notificationSettings: {
        mentionAdmins: { type: Boolean, default: false },
        sendDM: { type: Boolean, default: false },
        criticalOnly: { type: Boolean, default: true }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware
guildSettingsSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// İndeksler
guildSettingsSchema.index({ guildId: 1 });
guildSettingsSchema.index({ updatedAt: 1 });

module.exports = mongoose.model('GuildSettings', guildSettingsSchema); 