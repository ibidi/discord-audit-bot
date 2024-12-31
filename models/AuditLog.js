const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    type: { type: String, required: true },
    executorId: { type: String },
    targetId: { type: String },
    actionType: { type: String },
    reason: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    channelId: { type: String },
    oldData: { type: mongoose.Schema.Types.Mixed },
    newData: { type: mongoose.Schema.Types.Mixed },
    success: { type: Boolean, default: true },
    errorMessage: { type: String },
    metadata: {
        ip: String,
        device: String,
        location: String,
        browser: String
    },
    severity: { 
        type: String, 
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW'
    }
});

// İndeksler
auditLogSchema.index({ guildId: 1, timestamp: -1 });
auditLogSchema.index({ guildId: 1, type: 1 });
auditLogSchema.index({ guildId: 1, actionType: 1 });
auditLogSchema.index({ guildId: 1, severity: 1 });
auditLogSchema.index({ guildId: 1, executorId: 1 });
auditLogSchema.index({ guildId: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema); 