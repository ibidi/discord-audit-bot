# Discord Audit Bot 🛡️

Discord sunucunuz için gelişmiş denetim ve moderasyon botu. MongoDB entegrasyonu ile güçlendirilmiş, kapsamlı log sistemi ve otomatik moderasyon özellikleri sunar.

## 🌟 Özellikler

### 📝 Detaylı Log Sistemi
- Mesaj silme/düzenleme logları
- Üye giriş/çıkış ve yasaklama logları
- Rol ve kanal değişiklik logları
- Emoji ve çıkartma logları
- Ses kanalı hareketleri
- Thread işlemleri
- Davet oluşturma/silme
- Webhook ve entegrasyon değişiklikleri
- Stage etkinlik logları
- Kullanıcı durumu değişiklikleri

### 🤖 Otomatik Moderasyon
- Anti-spam sistemi
- Link engelleme
- Raid koruması
- Otomatik ceza sistemi (Uyarı, Susturma, Atma, Yasaklama)
- Özelleştirilebilir filtreler

### 💾 Yedekleme Sistemi
- Rol yedekleme
- Kanal yedekleme
- Sunucu ayarları yedekleme
- Yedekleri listeleme ve geri yükleme

### ⚠️ Uyarı Sistemi
- Süreli/süresiz uyarılar
- Uyarı listesi görüntüleme
- Uyarı kaldırma
- Otomatik uyarı temizleme

### 📊 İstatistikler
- Moderasyon istatistikleri
- Sunucu aktivite istatistikleri
- Detaylı log istatistikleri

## 🚀 Kurulum

1. Repository'yi klonlayın:
\`\`\`bash
git clone https://github.com/ibidi/discord-audit-bot.git
cd discord-audit-bot
\`\`\`

2. Gerekli paketleri yükleyin:
\`\`\`bash
npm install
\`\`\`

3. \`.env\` dosyasını oluşturun:
\`\`\`env
TOKEN=DISCORD_BOT_TOKEN
MONGODB_URI=MONGODB_BAGLANTI_URI
LOG_CHANNEL_ID=VARSAYILAN_LOG_KANALI_ID
\`\`\`

4. Botu başlatın:
\`\`\`bash
npm start
\`\`\`

## 📚 Komutlar

### Moderasyon Komutları
- \`/warn add\` - Kullanıcıya uyarı ver
- \`/warn list\` - Uyarıları listele
- \`/warn remove\` - Uyarı kaldır

### Yedekleme Komutları
- \`/backup create\` - Yeni yedek oluştur
- \`/backup list\` - Yedekleri listele
- \`/backup load\` - Yedek geri yükle

### AutoMod Komutları
- \`/automod antispam setup\` - Anti-spam ayarları
- \`/automod antilink setup\` - Link engelleme ayarları
- \`/automod raidprotection setup\` - Raid koruması ayarları

### Log Komutları
- \`/logs\` - Log kayıtlarını görüntüle
- \`/setlogchannel\` - Log kanalını ayarla
- \`/filter\` - Log filtrelerini ayarla

### İstatistik Komutları
- \`/stats\` - Sunucu istatistiklerini görüntüle
- \`/clear-stats\` - İstatistikleri sıfırla

## ⚙️ Yapılandırma

### Log Filtreleri
\`\`\`javascript
messages: true/false    // Mesaj logları
members: true/false     // Üye logları
voice: true/false      // Ses logları
roles: true/false      // Rol logları
channels: true/false   // Kanal logları
reactions: true/false  // Reaksiyon logları
threads: true/false    // Thread logları
invites: true/false    // Davet logları
presence: true/false   // Durum logları
webhooks: true/false   // Webhook logları
\`\`\`

### AutoMod Ayarları
\`\`\`javascript
antiSpam: {
    enabled: true/false,
    maxMessages: 5,     // Maksimum mesaj sayısı
    interval: 5000,     // MS cinsinden süre
    action: 'warn'      // warn, mute, kick, ban
}

antiLink: {
    enabled: true/false,
    action: 'warn'      // warn, mute, kick, ban
}

raidProtection: {
    enabled: true/false,
    joinThreshold: 10,  // Maksimum katılım sayısı
    timeWindow: 10000,  // MS cinsinden süre
    action: 'lockdown'  // lockdown, kick
}
\`\`\`

## 📋 Gereksinimler

- Node.js v16.9.0 veya üstü
- MongoDB
- Discord Bot Token
- Discord.js v14

## 🔒 Bot İzinleri

Bot'un düzgün çalışması için gerekli izinler:
- Mesajları Yönet
- Üyeleri Yasakla
- Üyeleri At
- Rolleri Yönet
- Kanalları Yönet
- Webhook'ları Yönet
- Denetim Kaydını Görüntüle
- Üyeleri Sustur
- Mesaj Geçmişini Görüntüle

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork'layın
2. Yeni bir branch oluşturun (\`git checkout -b feature/yeniözellik\`)
3. Değişikliklerinizi commit'leyin (\`git commit -am 'Yeni özellik: Açıklama'\`)
4. Branch'inizi push'layın (\`git push origin feature/yeniözellik\`)
5. Bir Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [Discord.js](https://discord.js.org/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/) 
