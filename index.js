require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    AuditLogEvent, 
    EmbedBuilder,
    Collection,
    Events,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');
const { connectToDatabase } = require('./utils/database');
const { cleanupOldLogs } = require('./utils/cleanup');
const GuildSettings = require('./models/GuildSettings');
const AuditLog = require('./models/AuditLog');
const Stats = require('./models/Stats');
const Backup = require('./models/Backup');
const Warning = require('./models/Warning');
const AutoMod = require('./models/AutoMod');

// Spam kontrolü için geçici veri saklama
const messageCache = new Collection();
const joinCache = new Collection();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences
    ]
});

// Yeni komutları ekle
const commands = [
    new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Sunucu denetim istatistiklerini gösterir'),
    new SlashCommandBuilder()
        .setName('setlogchannel')
        .setDescription('Log kanalını ayarlar')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Log kanalı')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Log filtreleme ayarlarını yapar')
        .addStringOption(option =>
            option.setName('tür')
                .setDescription('Filtre türü')
                .setRequired(true)
                .addChoices(
                    { name: 'Mesajlar', value: 'messages' },
                    { name: 'Üye Hareketleri', value: 'members' },
                    { name: 'Ses', value: 'voice' },
                    { name: 'Roller', value: 'roles' },
                    { name: 'Kanallar', value: 'channels' }
                ))
        .addBooleanOption(option =>
            option.setName('aktif')
                .setDescription('Filtreyi aktif/pasif yap')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('clear-stats')
        .setDescription('İstatistikleri sıfırlar')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Geçmiş logları görüntüle')
        .addStringOption(option =>
            option.setName('tür')
                .setDescription('Log türü')
                .setRequired(true)
                .addChoices(
                    { name: 'Tümü', value: 'all' },
                    { name: 'Mesajlar', value: 'messages' },
                    { name: 'Üyeler', value: 'members' },
                    { name: 'Kanallar', value: 'channels' },
                    { name: 'Roller', value: 'roles' }
                ))
        .addIntegerOption(option =>
            option.setName('sayfa')
                .setDescription('Sayfa numarası')
                .setMinValue(1)
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('backup')
        .setDescription('Sunucu yedekleme işlemleri')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Yeni bir yedek oluştur')
                .addStringOption(option =>
                    option.setName('tür')
                        .setDescription('Yedek türü')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Roller', value: 'roles' },
                            { name: 'Kanallar', value: 'channels' },
                            { name: 'Ayarlar', value: 'settings' }
                        ))
                .addStringOption(option =>
                    option.setName('açıklama')
                        .setDescription('Yedek açıklaması')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Yedekleri listele'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('load')
                .setDescription('Bir yedeği geri yükle')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('Yedek ID')
                        .setRequired(true))),
    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Kullanıcı uyarı işlemleri')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Kullanıcıya uyarı ver')
                .addUserOption(option =>
                    option.setName('kullanıcı')
                        .setDescription('Uyarılacak kullanıcı')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('sebep')
                        .setDescription('Uyarı sebebi')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('süre')
                        .setDescription('Uyarının geçerlilik süresi (gün)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Kullanıcının uyarılarını listele')
                .addUserOption(option =>
                    option.setName('kullanıcı')
                        .setDescription('Uyarıları listelenecek kullanıcı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Uyarı kaldır')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('Uyarı ID')
                        .setRequired(true))),
    new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Otomatik moderasyon ayarları')
        .addSubcommandGroup(group =>
            group
                .setName('antispam')
                .setDescription('Anti-spam ayarları')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('setup')
                        .setDescription('Anti-spam ayarlarını düzenle')
                        .addBooleanOption(option =>
                            option.setName('aktif')
                                .setDescription('Anti-spam aktif/pasif')
                                .setRequired(true))
                        .addIntegerOption(option =>
                            option.setName('limit')
                                .setDescription('Maksimum mesaj sayısı')
                                .setRequired(false))
                        .addIntegerOption(option =>
                            option.setName('süre')
                                .setDescription('Kontrol süresi (saniye)')
                                .setRequired(false))
                        .addStringOption(option =>
                            option.setName('eylem')
                                .setDescription('İhlal durumunda yapılacak işlem')
                                .addChoices(
                                    { name: 'Uyarı', value: 'warn' },
                                    { name: 'Susturma', value: 'mute' },
                                    { name: 'Atma', value: 'kick' },
                                    { name: 'Yasaklama', value: 'ban' }
                                )
                                .setRequired(false))))
        .addSubcommandGroup(group =>
            group
                .setName('antilink')
                .setDescription('Link engelleme ayarları')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('setup')
                        .setDescription('Link engelleme ayarlarını düzenle')
                        .addBooleanOption(option =>
                            option.setName('aktif')
                                .setDescription('Link engelleme aktif/pasif')
                                .setRequired(true))
                        .addStringOption(option =>
                            option.setName('eylem')
                                .setDescription('İhlal durumunda yapılacak işlem')
                                .addChoices(
                                    { name: 'Uyarı', value: 'warn' },
                                    { name: 'Susturma', value: 'mute' },
                                    { name: 'Atma', value: 'kick' },
                                    { name: 'Yasaklama', value: 'ban' }
                                )
                                .setRequired(false))))
        .addSubcommandGroup(group =>
            group
                .setName('raidprotection')
                .setDescription('Raid koruması ayarları')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('setup')
                        .setDescription('Raid koruması ayarlarını düzenle')
                        .addBooleanOption(option =>
                            option.setName('aktif')
                                .setDescription('Raid koruması aktif/pasif')
                                .setRequired(true))
                        .addIntegerOption(option =>
                            option.setName('limit')
                                .setDescription('Maksimum katılım sayısı')
                                .setRequired(false))
                        .addIntegerOption(option =>
                            option.setName('süre')
                                .setDescription('Kontrol süresi (saniye)')
                                .setRequired(false))
                        .addStringOption(option =>
                            option.setName('eylem')
                                .setDescription('İhlal durumunda yapılacak işlem')
                                .addChoices(
                                    { name: 'Kilitle', value: 'lockdown' },
                                    { name: 'At', value: 'kick' }
                                )
                                .setRequired(false))))
];

// Komutları Discord'a kaydet
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    
    // MongoDB'ye bağlan
    await connectToDatabase();
    
    // İlk temizlemeyi başlat
    await cleanupOldLogs();
    
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Slash komutları başarıyla kaydedildi!');
    } catch (error) {
        console.error('Slash komutları kaydedilirken hata oluştu:', error);
    }
});

// Slash komut işleyici
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'stats') {
        const stats = await Stats.findOne({ guildId: interaction.guildId }) || { stats: {} };

        const statsEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Sunucu Denetim İstatistikleri')
            .addFields(
                { name: 'Atılmalar', value: stats.stats.kicks?.toString() || '0', inline: true },
                { name: 'Yasaklamalar', value: stats.stats.bans?.toString() || '0', inline: true },
                { name: 'Kanal Değişiklikleri', value: stats.stats.channelChanges?.toString() || '0', inline: true },
                { name: 'Rol Değişiklikleri', value: stats.stats.roleChanges?.toString() || '0', inline: true },
                { name: 'Silinen Mesajlar', value: stats.stats.messageDeletes?.toString() || '0', inline: true },
                { name: 'Düzenlenen Mesajlar', value: stats.stats.messageEdits?.toString() || '0', inline: true },
                { name: 'Profil Güncellemeleri', value: stats.stats.memberUpdates?.toString() || '0', inline: true },
                { name: 'Sunucu Güncellemeleri', value: stats.stats.serverUpdates?.toString() || '0', inline: true }
            )
            .setFooter({ text: `Son Sıfırlama: ${stats.lastReset ? new Date(stats.lastReset).toLocaleString('tr-TR') : 'Hiç'}` })
            .setTimestamp();

        await interaction.reply({ embeds: [statsEmbed] });
    }

    if (interaction.commandName === 'setlogchannel') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
        }
        const channel = interaction.options.getChannel('kanal');
        
        await GuildSettings.findOneAndUpdate(
            { guildId: interaction.guildId },
            { 
                guildId: interaction.guildId,
                logChannelId: channel.id,
                updatedAt: new Date()
            },
            { upsert: true }
        );

        await interaction.reply(`Log kanalı ${channel} olarak ayarlandı!`);
    }

    if (interaction.commandName === 'filter') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
        }
        const type = interaction.options.getString('tür');
        const active = interaction.options.getBoolean('aktif');
        
        const updateData = {};
        updateData[`filters.${type}`] = active;
        
        await GuildSettings.findOneAndUpdate(
            { guildId: interaction.guildId },
            { 
                $set: updateData,
                updatedAt: new Date()
            },
            { upsert: true }
        );
        
        await interaction.reply(`${type} türündeki loglar ${active ? 'aktif' : 'pasif'} hale getirildi!`);
    }

    if (interaction.commandName === 'clear-stats') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
        }
        
        await Stats.findOneAndUpdate(
            { guildId: interaction.guildId },
            {
                $set: {
                    stats: {
                        kicks: 0,
                        bans: 0,
                        channelChanges: 0,
                        roleChanges: 0,
                        messageDeletes: 0,
                        messageEdits: 0,
                        memberUpdates: 0,
                        serverUpdates: 0
                    },
                    lastReset: new Date()
                }
            },
            { upsert: true }
        );

        await interaction.reply('İstatistikler sıfırlandı!');
    }

    if (interaction.commandName === 'logs') {
        const type = interaction.options.getString('tür');
        const page = interaction.options.getInteger('sayfa') || 1;
        const perPage = 10;

        const query = { guildId: interaction.guildId };
        if (type !== 'all') {
            query.type = type;
        }

        const totalLogs = await AuditLog.countDocuments(query);
        const totalPages = Math.ceil(totalLogs / perPage);

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        const logsEmbed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('Denetim Logları')
            .setDescription(logs.map(log => {
                const date = new Date(log.timestamp).toLocaleString('tr-TR');
                return `**${date}** - ${log.actionType}\n${log.details?.description || ''}\n`;
            }).join('\n'))
            .setFooter({ text: `Sayfa ${page}/${totalPages} • Toplam ${totalLogs} log` });

        await interaction.reply({ embeds: [logsEmbed] });
    }

    // Yedekleme komutları
    if (interaction.commandName === 'backup') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            const type = interaction.options.getString('tür');
            const description = interaction.options.getString('açıklama');
            let data = {};

            switch (type) {
                case 'roles':
                    data = await interaction.guild.roles.cache.map(role => ({
                        name: role.name,
                        color: role.color,
                        hoist: role.hoist,
                        permissions: role.permissions.bitfield,
                        position: role.position
                    }));
                    break;
                case 'channels':
                    data = await interaction.guild.channels.cache.map(channel => ({
                        name: channel.name,
                        type: channel.type,
                        parent: channel.parent?.id,
                        position: channel.position,
                        permissionOverwrites: channel.permissionOverwrites.cache.map(perm => ({
                            id: perm.id,
                            type: perm.type,
                            allow: perm.allow.bitfield,
                            deny: perm.deny.bitfield
                        }))
                    }));
                    break;
                case 'settings':
                    const settings = await GuildSettings.findOne({ guildId: interaction.guildId });
                    const automod = await AutoMod.findOne({ guildId: interaction.guildId });
                    data = { settings, automod };
                    break;
            }

            const backup = new Backup({
                guildId: interaction.guildId,
                type,
                data,
                description,
                createdBy: interaction.user.id
            });

            await backup.save();
            await interaction.reply(`${type} yedeği başarıyla oluşturuldu!`);
        }

        if (subcommand === 'list') {
            const backups = await Backup.find({ guildId: interaction.guildId })
                .sort({ createdAt: -1 })
                .limit(10);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Sunucu Yedekleri')
                .setDescription(backups.map(backup => {
                    const date = new Date(backup.createdAt).toLocaleString('tr-TR');
                    return `**ID:** ${backup._id}\n**Tür:** ${backup.type}\n**Tarih:** ${date}\n**Açıklama:** ${backup.description || 'Yok'}\n`;
                }).join('\n'))
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'load') {
            const backupId = interaction.options.getString('id');
            const backup = await Backup.findById(backupId);

            if (!backup || backup.guildId !== interaction.guildId) {
                return interaction.reply({ content: 'Geçersiz yedek ID!', ephemeral: true });
            }

            // Yedeği geri yükle
            switch (backup.type) {
                case 'roles':
                    // Mevcut rolleri sil
                    await interaction.guild.roles.cache.forEach(async role => {
                        if (role.name !== '@everyone' && role.position < interaction.guild.members.me.roles.highest.position) {
                            await role.delete().catch(() => null);
                        }
                    });

                    // Yeni rolleri oluştur
                    for (const roleData of backup.data) {
                        await interaction.guild.roles.create({
                            name: roleData.name,
                            color: roleData.color,
                            hoist: roleData.hoist,
                            permissions: roleData.permissions,
                            position: roleData.position
                        }).catch(() => null);
                    }
                    break;

                case 'channels':
                    // Mevcut kanalları sil
                    await interaction.guild.channels.cache.forEach(async channel => {
                        await channel.delete().catch(() => null);
                    });

                    // Önce kategorileri oluştur
                    for (const channelData of backup.data.filter(c => c.type === 4)) {
                        await interaction.guild.channels.create({
                            name: channelData.name,
                            type: channelData.type,
                            permissionOverwrites: channelData.permissionOverwrites
                        }).catch(() => null);
                    }

                    // Sonra diğer kanalları oluştur
                    for (const channelData of backup.data.filter(c => c.type !== 4)) {
                        await interaction.guild.channels.create({
                            name: channelData.name,
                            type: channelData.type,
                            parent: channelData.parent,
                            permissionOverwrites: channelData.permissionOverwrites
                        }).catch(() => null);
                    }
                    break;

                case 'settings':
                    await GuildSettings.findOneAndUpdate(
                        { guildId: interaction.guildId },
                        backup.data.settings,
                        { upsert: true }
                    );

                    await AutoMod.findOneAndUpdate(
                        { guildId: interaction.guildId },
                        backup.data.automod,
                        { upsert: true }
                    );
                    break;
            }

            await interaction.reply(`${backup.type} yedeği başarıyla geri yüklendi!`);
        }
    }

    // Uyarı komutları
    if (interaction.commandName === 'warn') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için moderatör yetkisine sahip olmalısınız!', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const user = interaction.options.getUser('kullanıcı');
            const reason = interaction.options.getString('sebep');
            const duration = interaction.options.getInteger('süre');

            const warning = new Warning({
                guildId: interaction.guildId,
                userId: user.id,
                moderatorId: interaction.user.id,
                reason,
                expires: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
            });

            await warning.save();

            // Kullanıcıya DM gönder
            try {
                await user.send(`**${interaction.guild.name}** sunucusunda uyarı aldınız!\nSebep: ${reason}`);
            } catch (error) {
                console.error('DM gönderilemedi:', error);
            }

            // Log kanalına bildir
            await logAuditEvent(interaction.guildId, 'members', {
                executorId: interaction.user.id,
                targetId: user.id,
                actionType: 'MEMBER_WARN',
                reason,
                details: {
                    description: `👮 ${user.tag} kullanıcısı uyarıldı`,
                    reason,
                    duration: duration ? `${duration} gün` : 'Süresiz'
                },
                statField: 'memberWarnings'
            });

            await interaction.reply(`${user.tag} kullanıcısı başarıyla uyarıldı!`);
        }

        if (subcommand === 'list') {
            const user = interaction.options.getUser('kullanıcı');
            const warnings = await Warning.find({
                guildId: interaction.guildId,
                userId: user.id,
                active: true
            }).sort({ timestamp: -1 });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(`${user.tag} - Uyarılar`)
                .setDescription(warnings.map(warn => {
                    const date = new Date(warn.timestamp).toLocaleString('tr-TR');
                    const expires = warn.expires ? new Date(warn.expires).toLocaleString('tr-TR') : 'Süresiz';
                    return `**ID:** ${warn._id}\n**Sebep:** ${warn.reason}\n**Moderatör:** <@${warn.moderatorId}>\n**Tarih:** ${date}\n**Bitiş:** ${expires}\n`;
                }).join('\n') || 'Aktif uyarı bulunmuyor.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'remove') {
            const warningId = interaction.options.getString('id');
            const warning = await Warning.findById(warningId);

            if (!warning || warning.guildId !== interaction.guildId) {
                return interaction.reply({ content: 'Geçersiz uyarı ID!', ephemeral: true });
            }

            warning.active = false;
            await warning.save();

            await interaction.reply('Uyarı başarıyla kaldırıldı!');
        }
    }

    // AutoMod komutları
    if (interaction.commandName === 'automod') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!', ephemeral: true });
        }

        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (group === 'antispam' && subcommand === 'setup') {
            const enabled = interaction.options.getBoolean('aktif');
            const maxMessages = interaction.options.getInteger('limit') || 5;
            const interval = (interaction.options.getInteger('süre') || 5) * 1000;
            const action = interaction.options.getString('eylem') || 'warn';

            await AutoMod.findOneAndUpdate(
                { guildId: interaction.guildId },
                {
                    $set: {
                        'settings.antiSpam': {
                            enabled,
                            maxMessages,
                            interval,
                            action
                        }
                    }
                },
                { upsert: true }
            );

            await interaction.reply('Anti-spam ayarları güncellendi!');
        }

        if (group === 'antilink' && subcommand === 'setup') {
            const enabled = interaction.options.getBoolean('aktif');
            const action = interaction.options.getString('eylem') || 'warn';

            await AutoMod.findOneAndUpdate(
                { guildId: interaction.guildId },
                {
                    $set: {
                        'settings.antiLink': {
                            enabled,
                            action
                        }
                    }
                },
                { upsert: true }
            );

            await interaction.reply('Link engelleme ayarları güncellendi!');
        }

        if (group === 'raidprotection' && subcommand === 'setup') {
            const enabled = interaction.options.getBoolean('aktif');
            const joinThreshold = interaction.options.getInteger('limit') || 10;
            const timeWindow = (interaction.options.getInteger('süre') || 10) * 1000;
            const action = interaction.options.getString('eylem') || 'lockdown';

            await AutoMod.findOneAndUpdate(
                { guildId: interaction.guildId },
                {
                    $set: {
                        'settings.raidProtection': {
                            enabled,
                            joinThreshold,
                            timeWindow,
                            action
                        }
                    }
                },
                { upsert: true }
            );

            await interaction.reply('Raid koruması ayarları güncellendi!');
        }
    }
});

// AutoMod işleyicileri
client.on(Events.MessageCreate, async message => {
    if (!message.guild || message.author.bot) return;

    const automod = await AutoMod.findOne({ guildId: message.guild.id });
    if (!automod) return;

    // Anti-spam kontrolü
    if (automod.settings.antiSpam.enabled) {
        const { maxMessages, interval, action } = automod.settings.antiSpam;
        const key = `${message.guild.id}-${message.author.id}`;
        const userMessages = messageCache.get(key) || [];
        
        userMessages.push(message.createdTimestamp);
        messageCache.set(key, userMessages);

        // Eski mesajları temizle
        const now = Date.now();
        const recentMessages = userMessages.filter(timestamp => now - timestamp < interval);
        messageCache.set(key, recentMessages);

        if (recentMessages.length >= maxMessages) {
            // Ceza uygula
            await handleAutoModViolation(message, 'SPAM', action);
        }
    }

    // Anti-link kontrolü
    if (automod.settings.antiLink.enabled) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        if (urlRegex.test(message.content)) {
            const { action } = automod.settings.antiLink;
            await handleAutoModViolation(message, 'LINK', action);
        }
    }
});

// Raid koruması
client.on(Events.GuildMemberAdd, async member => {
    const automod = await AutoMod.findOne({ guildId: member.guild.id });
    if (!automod?.settings.raidProtection.enabled) return;

    const { joinThreshold, timeWindow, action } = automod.settings.raidProtection;
    const key = member.guild.id;
    const joins = joinCache.get(key) || [];
    
    joins.push(Date.now());
    joinCache.set(key, joins);

    // Eski girişleri temizle
    const now = Date.now();
    const recentJoins = joins.filter(timestamp => now - timestamp < timeWindow);
    joinCache.set(key, recentJoins);

    if (recentJoins.length >= joinThreshold) {
        if (action === 'lockdown') {
            // Sunucuyu kilitle
            await member.guild.channels.cache.forEach(async channel => {
                if (channel.manageable) {
                    await channel.permissionOverwrites.edit(member.guild.roles.everyone, {
                        SendMessages: false,
                        Connect: false
                    });
                }
            });

            // Log kanalına bildir
            await logAuditEvent(member.guild.id, 'raid', {
                actionType: 'RAID_LOCKDOWN',
                details: {
                    description: '🚨 Raid tespit edildi! Sunucu kilitlendi.',
                    joinCount: recentJoins.length,
                    timeWindow: timeWindow / 1000
                }
            });
        } else if (action === 'kick') {
            // Son katılanları at
            for (const timestamp of recentJoins) {
                const recentMember = (await member.guild.members.fetch())
                    .find(m => m.joinedTimestamp >= timestamp);
                if (recentMember && recentMember.kickable) {
                    await recentMember.kick('Raid koruması: Toplu katılım tespit edildi');
                }
            }
        }
    }
});

// Ceza uygulama fonksiyonu
async function handleAutoModViolation(message, type, action) {
    // Mesajı sil
    await message.delete().catch(() => null);

    switch (action) {
        case 'warn':
            const warning = new Warning({
                guildId: message.guild.id,
                userId: message.author.id,
                moderatorId: client.user.id,
                reason: `AutoMod: ${type} ihlali`,
                timestamp: new Date()
            });
            await warning.save();
            break;

        case 'mute':
            const automod = await AutoMod.findOne({ guildId: message.guild.id });
            const duration = automod.settings.muteDuration;
            await message.member.timeout(duration, `AutoMod: ${type} ihlali`);
            break;

        case 'kick':
            await message.member.kick(`AutoMod: ${type} ihlali`);
            break;

        case 'ban':
            await message.member.ban({ reason: `AutoMod: ${type} ihlali` });
            break;
    }

    // Log kanalına bildir
    await logAuditEvent(message.guild.id, 'automod', {
        executorId: client.user.id,
        targetId: message.author.id,
        actionType: `AUTOMOD_${type}`,
        reason: `AutoMod: ${type} ihlali`,
        details: {
            description: `🤖 AutoMod: ${type} ihlali tespit edildi`,
            action: action,
            channel: message.channel.name
        }
    });
}

// Emoji reaksiyon logları
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    
    const message = reaction.message;
    if (!message.guild) return;

    await logAuditEvent(message.guild.id, 'reactions', {
        executorId: user.id,
        targetId: message.id,
        channelId: message.channel.id,
        actionType: 'REACTION_ADD',
        details: {
            description: `👍 ${user.tag} bir reaksiyon ekledi`,
            emoji: reaction.emoji.toString(),
            messageContent: message.content.substring(0, 100),
            messageAuthor: message.author.tag
        },
        severity: 'LOW'
    });
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return;
    
    const message = reaction.message;
    if (!message.guild) return;

    await logAuditEvent(message.guild.id, 'reactions', {
        executorId: user.id,
        targetId: message.id,
        channelId: message.channel.id,
        actionType: 'REACTION_REMOVE',
        details: {
            description: `👎 ${user.tag} bir reaksiyon kaldırdı`,
            emoji: reaction.emoji.toString(),
            messageContent: message.content.substring(0, 100),
            messageAuthor: message.author.tag
        },
        severity: 'LOW'
    });
});

// Thread olayları
client.on(Events.ThreadCreate, async thread => {
    await logAuditEvent(thread.guild.id, 'threads', {
        executorId: thread.ownerId,
        targetId: thread.id,
        channelId: thread.parentId,
        actionType: 'THREAD_CREATE',
        details: {
            description: `🧵 Yeni thread oluşturuldu: ${thread.name}`,
            type: thread.type,
            autoArchiveDuration: thread.autoArchiveDuration
        },
        severity: 'LOW'
    });
});

client.on(Events.ThreadDelete, async thread => {
    await logAuditEvent(thread.guild.id, 'threads', {
        targetId: thread.id,
        channelId: thread.parentId,
        actionType: 'THREAD_DELETE',
        details: {
            description: `🗑️ Thread silindi: ${thread.name}`,
            type: thread.type
        },
        severity: 'MEDIUM'
    });
});

// Davet olayları
client.on(Events.InviteCreate, async invite => {
    await logAuditEvent(invite.guild.id, 'invites', {
        executorId: invite.inviterId,
        targetId: invite.code,
        actionType: 'INVITE_CREATE',
        details: {
            description: `🎟️ Yeni davet oluşturuldu`,
            code: invite.code,
            maxUses: invite.maxUses,
            maxAge: invite.maxAge,
            temporary: invite.temporary
        },
        severity: 'MEDIUM'
    });
});

client.on(Events.InviteDelete, async invite => {
    await logAuditEvent(invite.guild.id, 'invites', {
        targetId: invite.code,
        actionType: 'INVITE_DELETE',
        details: {
            description: `🎟️ Davet silindi`,
            code: invite.code
        },
        severity: 'MEDIUM'
    });
});

// Kullanıcı durumu değişiklikleri
client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
    if (!oldPresence || !newPresence) return;

    const changes = [];
    
    if (oldPresence.status !== newPresence.status) {
        changes.push(`Durum: ${oldPresence.status} ➜ ${newPresence.status}`);
    }

    if (oldPresence.activities.length !== newPresence.activities.length) {
        const newActivities = newPresence.activities.map(a => a.name).join(', ');
        changes.push(`Aktiviteler: ${newActivities}`);
    }

    if (changes.length > 0) {
        await logAuditEvent(newPresence.guild.id, 'presence', {
            executorId: newPresence.userId,
            targetId: newPresence.userId,
            actionType: 'PRESENCE_UPDATE',
            details: {
                description: `👤 ${newPresence.member.user.tag} durumu güncellendi`,
                changes: changes
            },
            severity: 'LOW'
        });
    }
});

// Webhook olayları
client.on(Events.WebhooksUpdate, async channel => {
    await logAuditEvent(channel.guild.id, 'webhooks', {
        channelId: channel.id,
        actionType: 'WEBHOOK_UPDATE',
        details: {
            description: `🔗 ${channel.name} kanalında webhook değişikliği`,
            channelType: channel.type
        },
        severity: 'HIGH'
    });
});

// Entegrasyon olayları
client.on(Events.GuildIntegrationsUpdate, async guild => {
    await logAuditEvent(guild.id, 'integrations', {
        actionType: 'INTEGRATION_UPDATE',
        details: {
            description: `🔌 Sunucu entegrasyonları güncellendi`
        },
        severity: 'HIGH'
    });
});

// Stage olayları
client.on(Events.StageInstanceCreate, async stage => {
    await logAuditEvent(stage.guild.id, 'stage', {
        channelId: stage.channelId,
        actionType: 'STAGE_CREATE',
        details: {
            description: `🎭 Yeni sahne başlatıldı: ${stage.topic}`,
            topic: stage.topic,
            privacy: stage.privacyLevel
        },
        severity: 'LOW'
    });
});

client.on(Events.StageInstanceDelete, async stage => {
    await logAuditEvent(stage.guild.id, 'stage', {
        channelId: stage.channelId,
        actionType: 'STAGE_DELETE',
        details: {
            description: `🎭 Sahne sonlandırıldı: ${stage.topic}`
        },
        severity: 'LOW'
    });
});

// Stickerler
client.on(Events.GuildStickerCreate, async sticker => {
    await logAuditEvent(sticker.guild.id, 'stickers', {
        targetId: sticker.id,
        actionType: 'STICKER_CREATE',
        details: {
            description: `🏷️ Yeni çıkartma eklendi: ${sticker.name}`,
            name: sticker.name,
            description: sticker.description,
            tags: sticker.tags
        },
        severity: 'LOW'
    });
});

client.on(Events.GuildStickerDelete, async sticker => {
    await logAuditEvent(sticker.guild.id, 'stickers', {
        targetId: sticker.id,
        actionType: 'STICKER_DELETE',
        details: {
            description: `🏷️ Çıkartma silindi: ${sticker.name}`
        },
        severity: 'LOW'
    });
});

// Scheduled Event olayları
client.on(Events.GuildScheduledEventCreate, async event => {
    await logAuditEvent(event.guild.id, 'events', {
        executorId: event.creatorId,
        targetId: event.id,
        actionType: 'EVENT_CREATE',
        details: {
            description: `📅 Yeni etkinlik oluşturuldu: ${event.name}`,
            name: event.name,
            description: event.description,
            scheduledStartTime: event.scheduledStartTime,
            scheduledEndTime: event.scheduledEndTime,
            entityType: event.entityType,
            status: event.status
        },
        severity: 'MEDIUM'
    });
});

client.on(Events.GuildScheduledEventDelete, async event => {
    await logAuditEvent(event.guild.id, 'events', {
        targetId: event.id,
        actionType: 'EVENT_DELETE',
        details: {
            description: `📅 Etkinlik silindi: ${event.name}`
        },
        severity: 'MEDIUM'
    });
});

// Rol güncellemeleri
client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
    const changes = [];
    
    if (oldRole.name !== newRole.name) {
        changes.push(`İsim: ${oldRole.name} ➜ ${newRole.name}`);
    }
    if (oldRole.color !== newRole.color) {
        changes.push(`Renk: ${oldRole.color.toString(16)} ➜ ${newRole.color.toString(16)}`);
    }
    if (oldRole.hoist !== newRole.hoist) {
        changes.push(`Ayrı Göster: ${oldRole.hoist} ➜ ${newRole.hoist}`);
    }
    if (oldRole.mentionable !== newRole.mentionable) {
        changes.push(`Bahsedilebilir: ${oldRole.mentionable} ➜ ${newRole.mentionable}`);
    }
    if (!oldRole.permissions.equals(newRole.permissions)) {
        const addedPerms = newRole.permissions.missing(oldRole.permissions);
        const removedPerms = oldRole.permissions.missing(newRole.permissions);
        if (addedPerms.length > 0) changes.push(`Eklenen Yetkiler: ${addedPerms.join(', ')}`);
        if (removedPerms.length > 0) changes.push(`Kaldırılan Yetkiler: ${removedPerms.join(', ')}`);
    }

    if (changes.length > 0) {
        await logAuditEvent(newRole.guild.id, 'roles', {
            targetId: newRole.id,
            actionType: 'ROLE_UPDATE',
            oldData: {
                name: oldRole.name,
                color: oldRole.color,
                hoist: oldRole.hoist,
                mentionable: oldRole.mentionable,
                permissions: oldRole.permissions.bitfield
            },
            newData: {
                name: newRole.name,
                color: newRole.color,
                hoist: newRole.hoist,
                mentionable: newRole.mentionable,
                permissions: newRole.permissions.bitfield
            },
            details: {
                description: `👔 ${newRole.name} rolü güncellendi`,
                changes: changes
            },
            severity: 'MEDIUM'
        });
    }
});

// Kanal güncellemeleri
client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
    if (!oldChannel.guild) return;

    const changes = [];
    
    if (oldChannel.name !== newChannel.name) {
        changes.push(`İsim: ${oldChannel.name} ➜ ${newChannel.name}`);
    }
    if (oldChannel.type !== newChannel.type) {
        changes.push(`Tür: ${oldChannel.type} ➜ ${newChannel.type}`);
    }
    if (oldChannel.topic !== newChannel.topic) {
        changes.push(`Konu: ${oldChannel.topic || 'Yok'} ➜ ${newChannel.topic || 'Yok'}`);
    }
    if (oldChannel.nsfw !== newChannel.nsfw) {
        changes.push(`NSFW: ${oldChannel.nsfw} ➜ ${newChannel.nsfw}`);
    }
    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        changes.push(`Yavaş Mod: ${oldChannel.rateLimitPerUser}s ➜ ${newChannel.rateLimitPerUser}s`);
    }

    if (changes.length > 0) {
        await logAuditEvent(newChannel.guild.id, 'channels', {
            channelId: newChannel.id,
            actionType: 'CHANNEL_UPDATE',
            oldData: {
                name: oldChannel.name,
                type: oldChannel.type,
                topic: oldChannel.topic,
                nsfw: oldChannel.nsfw,
                rateLimitPerUser: oldChannel.rateLimitPerUser
            },
            newData: {
                name: newChannel.name,
                type: newChannel.type,
                topic: newChannel.topic,
                nsfw: newChannel.nsfw,
                rateLimitPerUser: newChannel.rateLimitPerUser
            },
            details: {
                description: `📝 ${newChannel.name} kanalı güncellendi`,
                changes: changes
            },
            severity: 'MEDIUM'
        });
    }
});

// Log kayıt fonksiyonu
async function logAuditEvent(guildId, type, data) {
    try {
        const settings = await GuildSettings.findOne({ guildId });
        if (!settings || !settings.filters[type]) return null;

        // Metadata bilgilerini ekle
        const metadata = {
            timestamp: new Date(),
            device: process.platform,
            location: 'Server-Side'
        };

        const logEntry = new AuditLog({
            guildId,
            type,
            executorId: data.executorId,
            targetId: data.targetId,
            actionType: data.actionType,
            reason: data.reason,
            details: data.details,
            channelId: data.channelId,
            oldData: data.oldData,
            newData: data.newData,
            metadata,
            severity: data.severity || 'LOW',
            timestamp: new Date()
        });

        await logEntry.save();

        // İstatistikleri güncelle
        if (data.statField) {
            const statsUpdate = {};
            statsUpdate[`stats.${data.statField}`] = 1;

            await Stats.findOneAndUpdate(
                { guildId },
                { $inc: statsUpdate },
                { upsert: true }
            );
        }

        return settings.logChannelId;
    } catch (error) {
        console.error('Log kaydı sırasında hata:', error);
        
        // Hata logunu kaydet
        const errorLog = new AuditLog({
            guildId,
            type: 'error',
            actionType: 'LOG_ERROR',
            details: {
                description: 'Log kaydı sırasında hata oluştu',
                error: error.message,
                stack: error.stack
            },
            success: false,
            errorMessage: error.message,
            severity: 'HIGH'
        });
        await errorLog.save().catch(console.error);
        
        return null;
    }
}

client.login(process.env.TOKEN); 