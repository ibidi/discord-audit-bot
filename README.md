<div align="center">

# Discord Audit Bot 🛡️

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/node.js-v16.9.0-green.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/mongodb-v5-green.svg)](https://www.mongodb.com)

<p align="center">
  <img src="https://i.imgur.com/XYZ123.png" alt="Bot Logo" width="200"/>
  <br>
  Discord sunucunuz için gelişmiş denetim ve moderasyon botu.
  <br>
  MongoDB entegrasyonu ile güçlendirilmiş, kapsamlı log sistemi ve otomatik moderasyon özellikleri.
</p>

[Özellikleri Keşfet](#-özellikler) • 
[Hızlı Başlangıç](#-hızlı-başlangıç) • 
[Komutlar](#-komutlar) • 
[Yapılandırma](#%EF%B8%8F-yapılandırma) • 
[Katkıda Bulun](#-katkıda-bulunma)

</div>

## ✨ Özellikler

<details>
<summary>📝 Detaylı Log Sistemi</summary>

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
</details>

<details>
<summary>🤖 Otomatik Moderasyon</summary>

- Anti-spam sistemi
- Link engelleme
- Raid koruması
- Otomatik ceza sistemi
  - Uyarı
  - Susturma
  - Atma
  - Yasaklama
- Özelleştirilebilir filtreler
</details>

<details>
<summary>💾 Yedekleme Sistemi</summary>

- Rol yedekleme
- Kanal yedekleme
- Sunucu ayarları yedekleme
- Yedekleri listeleme ve geri yükleme
</details>

<details>
<summary>⚠️ Uyarı Sistemi</summary>

- Süreli/süresiz uyarılar
- Uyarı listesi görüntüleme
- Uyarı kaldırma
- Otomatik uyarı temizleme
</details>

<details>
<summary>📊 İstatistikler</summary>

- Moderasyon istatistikleri
- Sunucu aktivite istatistikleri
- Detaylı log istatistikleri
</details>

## 🚀 Hızlı Başlangıç

1. Repository'yi klonlayın:
```bash
git clone https://github.com/kullaniciadi/discord-audit-bot.git
cd discord-audit-bot
```

2. Gerekli paketleri yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```env
TOKEN=DISCORD_BOT_TOKEN
MONGODB_URI=MONGODB_BAGLANTI_URI
LOG_CHANNEL_ID=VARSAYILAN_LOG_KANALI_ID
```

4. Botu başlatın:
```bash
npm start
```

## 📚 Komutlar

<details>
<summary>👮 Moderasyon Komutları</summary>

| Komut | Açıklama |
|-------|-----------|
| `/warn add` | Kullanıcıya uyarı ver |
| `/warn list` | Uyarıları listele |
| `/warn remove` | Uyarı kaldır |
</details>

<details>
<summary>💾 Yedekleme Komutları</summary>

| Komut | Açıklama |
|-------|-----------|
| `/backup create` | Yeni yedek oluştur |
| `/backup list` | Yedekleri listele |
| `/backup load` | Yedek geri yükle |
</details>

<details>
<summary>🤖 AutoMod Komutları</summary>

| Komut | Açıklama |
|-------|-----------|
| `/automod antispam setup` | Anti-spam ayarları |
| `/automod antilink setup` | Link engelleme ayarları |
| `/automod raidprotection setup` | Raid koruması ayarları |
</details>

<details>
<summary>📝 Log Komutları</summary>

| Komut | Açıklama |
|-------|-----------|
| `/logs` | Log kayıtlarını görüntüle |
| `/setlogchannel` | Log kanalını ayarla |
| `/filter` | Log filtrelerini ayarla |
</details>

<details>
<summary>📊 İstatistik Komutları</summary>

| Komut | Açıklama |
|-------|-----------|
| `/stats` | Sunucu istatistiklerini görüntüle |
| `/clear-stats` | İstatistikleri sıfırla |
</details>

## ⚙️ Yapılandırma

<details>
<summary>Log Filtreleri</summary>

```javascript
{
    "messages": true,    // Mesaj logları
    "members": true,     // Üye logları
    "voice": true,       // Ses logları
    "roles": true,       // Rol logları
    "channels": true,    // Kanal logları
    "reactions": true,   // Reaksiyon logları
    "threads": true,     // Thread logları
    "invites": true,     // Davet logları
    "presence": false,   // Durum logları
    "webhooks": true     // Webhook logları
}
```
</details>

<details>
<summary>AutoMod Ayarları</summary>

```javascript
{
    "antiSpam": {
        "enabled": true,
        "maxMessages": 5,     // Maksimum mesaj sayısı
        "interval": 5000,     // MS cinsinden süre
        "action": "warn"      // warn, mute, kick, ban
    },
    "antiLink": {
        "enabled": true,
        "action": "warn"      // warn, mute, kick, ban
    },
    "raidProtection": {
        "enabled": true,
        "joinThreshold": 10,  // Maksimum katılım sayısı
        "timeWindow": 10000,  // MS cinsinden süre
        "action": "lockdown"  // lockdown, kick
    }
}
```
</details>

## 📋 Gereksinimler

| Gereksinim | Versiyon |
|------------|----------|
| Node.js | v16.9.0+ |
| MongoDB | v5.0+ |
| Discord.js | v14 |

## 🔒 Bot İzinleri

Bot'un düzgün çalışması için gerekli izinler:

- [x] Mesajları Yönet
- [x] Üyeleri Yasakla
- [x] Üyeleri At
- [x] Rolleri Yönet
- [x] Kanalları Yönet
- [x] Webhook'ları Yönet
- [x] Denetim Kaydını Görüntüle
- [x] Üyeleri Sustur
- [x] Mesaj Geçmişini Görüntüle

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork'layın
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniözellik`)
3. Değişikliklerinizi commit'leyin (`git commit -am 'Yeni özellik: Açıklama'`)
4. Branch'inizi push'layın (`git push origin feature/yeniözellik`)
5. Bir Pull Request oluşturun

## 📄 Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.

## 🙏 Teşekkürler

Bu projenin geliştirilmesinde kullanılan harika araçlar:

<div align="center">
  <a href="https://discord.js.org">
    <img src="https://discord.js.org/static/logo.svg" width="50" alt="Discord.js" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://www.mongodb.com">
    <img src="https://raw.githubusercontent.com/mongodb/mongo/master/docs/leaf.svg" width="50" alt="MongoDB" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://nodejs.org">
    <img src="https://nodejs.org/static/images/logo.svg" width="50" alt="Node.js" />
  </a>
</div>

---
<div align="center">
  Geliştirici: [Kullanıcı Adı](https://github.com/kullaniciadi) • 
  [Discord Sunucusu](https://discord.gg/DAVET_KODU) • 
  [Botu Davet Et](https://discord.com/api/oauth2/authorize?client_id=BOT_ID&permissions=8&scope=bot%20applications.commands)
</div> 