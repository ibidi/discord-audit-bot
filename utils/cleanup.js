const AuditLog = require('../models/AuditLog');
const GuildSettings = require('../models/GuildSettings');

async function cleanupOldLogs() {
    try {
        const guilds = await GuildSettings.find({}, 'guildId logRetentionDays');
        
        for (const guild of guilds) {
            const retentionDays = guild.logRetentionDays || 30;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            // Kritik olmayan logları sil
            await AuditLog.deleteMany({
                guildId: guild.guildId,
                timestamp: { $lt: cutoffDate },
                severity: { $nin: ['HIGH', 'CRITICAL'] }
            });

            // Kritik logları daha uzun süre sakla (90 gün)
            const criticalCutoffDate = new Date();
            criticalCutoffDate.setDate(criticalCutoffDate.getDate() - 90);

            await AuditLog.deleteMany({
                guildId: guild.guildId,
                timestamp: { $lt: criticalCutoffDate },
                severity: { $in: ['HIGH', 'CRITICAL'] }
            });
        }
    } catch (error) {
        console.error('Log temizleme sırasında hata:', error);
    }
}

// Her gün çalıştır
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

module.exports = { cleanupOldLogs }; 