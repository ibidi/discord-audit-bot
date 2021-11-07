const Discord = require('discord.js')
const client = new Discord.Client()
const logs = require('discord-logs');
const moment = require("moment");
require("moment-duration-format");
const config = require('./config.json')
logs(client);


var prefix = config.prefix;
var rGuild = config.guild;


client.on('ready', () => {
    console.log(`${client.user.tag} aktif oldu!`);
    client.user.setActivity('ibidi', { type: 'PLAYING', status: "online" })
  .then(presence => console.log(`Durum ${presence.activities[0].name} olarak ayarlandı.`))
});


client.on("ready", async message => {
  const channel = client.channels.cache.get("");
  if (!channel) return console.error("Kanal 'ID' girilmemiş.");
  channel
    .join()
    .then(connection => {
      console.log("Başarıyla bağlanıldı.");
    })
    .catch(e => {
      console.error(e);
    });
});

client.getDate = (date, type) => {
  let sure;
  date = Number(date);
  if (type === "saniye") { sure = (date * 1000) }
  else if (type === "dakika") { sure = (60 * 1000) * date }
  else if (type === "saat") { sure = ((60 * 1000) * 60) * date }
  else if (type === "gün") { sure = (((60 * 1000) * 60) * 24) * date }
  else if (type === "hafta") { sure = ((((60 * 1000) * 60) * 24) * 7) * date }
  else if (type === "ay") { sure = ((((60 * 1000) * 60) * 24) * 30) * date }
  else if (type === "yıl") { sure = ((((((60 * 1000) * 60) * 24) * 30) * 12) + 5) * date };
  return sure;
  };

  client.tarih = (date) => {
    const startedAt = Date.parse(date);
    var msecs = Math.abs(new Date() - startedAt);
  
    const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365));
    msecs -= years * 1000 * 60 * 60 * 24 * 365;
    const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30));
    msecs -= months * 1000 * 60 * 60 * 24 * 30;
    const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7));
    msecs -= weeks * 1000 * 60 * 60 * 24 * 7;
    const days = Math.floor(msecs / (1000 * 60 * 60 * 24));
    msecs -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(msecs / (1000 * 60 * 60));
    msecs -= hours * 1000 * 60 * 60;
    const mins = Math.floor((msecs / (1000 * 60)));
    msecs -= mins * 1000 * 60;
    const secs = Math.floor(msecs / 1000);
    msecs -= secs * 1000;
  
    var string = "";
    if (years > 0) string += `${years} yıl ${months} ay`
    else if (months > 0) string += `${months} ay ${weeks > 0 ? weeks+" hafta" : ""}`
    else if (weeks > 0) string += `${weeks} hafta ${days > 0 ? days+" gün" : ""}`
    else if (days > 0) string += `${days} gün ${hours > 0 ? hours+" saat" : ""}`
    else if (hours > 0) string += `${hours} saat ${mins > 0 ? mins+" dakika" : ""}`
    else if (mins > 0) string += `${mins} dakika ${secs > 0 ? secs+" saniye" : ""}`
    else if (secs > 0) string += `${secs} saniye`
    else string += `saniyeler`;
  
    string = string.trim();
    return `\`${string} önce\``;
  };

client.toDate = date => {
  return moment(date).format("DD.MM.YYYY HH:mm:ss");
};

//Log Kanalları

sesLog = '';
mesajlog = '';
guildLog = '';
rolLog = '';
userLog = '';
yayinLog = '';
userAvatarLog = '';

//Kullanıcı Log

client.on("guildMemberAdd", (member, message) => {
  client.channels.cache.get(guildLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`${member} üyesi sunucuya katıldı.`).setColor('#65cafe'))
});

client.on("guildMemberRemove", (member, message) => {
  client.channels.cache.get(guildLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`${member} üyesi sunucudan ayrıldı.`).setColor('#red'))
});

//Mesaj Log

client.on("messageContentEdited", (message, oldContent, newContent) => {
  if(message.author.bot || message.channel.type === "dm") return;
  if(message.guild.id !== rGuild) return;
    client.channels.cache.get(mesajlog).send(new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.displayAvatarURL()).setDescription(`${message.author} üyesi ${message.channel} kanalındaki mesajı düzenledi.\n\n**__Eski Mesaj:__** \`${oldContent}\`\n\n**__Yeni Mesaj:__** \`${newContent}\`\n\n\`\`\`Kanal: #${message.channel.name} (${message.channel.id})\nKullanıcı: ${message.member.user.tag} (${message.member.id})\nMesaj ID: ${message.id}\nMesajın düzenlenme tarihi: ${client.toDate(new Date())}\`\`\``).setColor('#a3ff8b'))
  });
  
client.on('messageDelete', message  => {
    if(message.author.bot || message.channel.type === "dm") return;
    if(message.guild.id !== rGuild) return;
    client.channels.cache.get(mesajlog).send(new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.displayAvatarURL()).setDescription(`${message.author} üyesi ${message.channel} kanalındaki bir mesajını silindi.\n\n**__Silinen Mesaj:__** \`${message.content}\`\n\n\`\`\`Kanal: #${message.channel.name} (${message.channel.id})\nKullanıcı: ${message.member.user.tag} (${message.member.id})\nMesaj ID: ${message.id}\nMesajın silinme tarihi: ${client.toDate(new Date())}\`\`\``).setColor('#8b0000'))
  })
  
//Ses Log

client.on("voiceChannelJoin", (member, channel) => {
    client.channels.cache.get(sesLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) kişisi \`${channel.name}\` kanalına giriş yaptı.`).setColor('RANDOM'))
  })
  
  client.on("voiceChannelLeave", (member, channel) => {
    client.channels.cache.get(sesLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) kişisi \`${channel.name}\` kanalından çıkış yaptı.`).setColor('RANDOM'))
  })
  
  client.on("voiceChannelSwitch", (member, oldChannel, newChannel) => {
    client.channels.cache.get(sesLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) kişisi \`${oldChannel.name}\` kanalından\n\`${newChannel.name}\` kanalına geçiş yaptı.`).setColor('RANDOM'))
  })

//Rol Log

client.on("guildMemberRoleAdd", (member, role, message) =>{
    client.channels.cache.get(rolLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) adlı üyeye bir rol verildi. \n **Verilen rol:** <@&${role.id}>`).setColor('RANDOM'))
  })
  
client.on("guildMemberRoleRemove", (member, role) =>{
    client.channels.cache.get(rolLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) adlı üyeden bir rol alındı. \n **Alınan rol:** <@&${role.id}>`).setColor('RANDOM'))
  })
  
//Guild Log

client.on("guildMemberBoost", (member) => {
  client.channels.cache.get(guildLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> kişisi boost bastı.`).setColor('RANDOM'))
});

client.on("guildMemberUnboost", (member) => {
  client.channels.cache.get(guildLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> kişisi boostunu çekti.`).setColor('RANDOM'))
});

client.on("voiceStreamingStart", (member, voiceChannel) => {
  client.channels.cache.get(yayinLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) adlı üye \`${voiceChannel.name}\` adlı kanalda yayın başlattı.`).setColor('RANDOM'))
});

client.on("voiceStreamingStop", (member, voiceChannel) => {
  client.channels.cache.get(yayinLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) adlı üye \`${voiceChannel.name}\` adlı kanalda yayını kapattı.`).setColor('RANDOM'))
});

//User Log

client.on("voiceChannelMute", (member) => {
  client.channels.cache.get(sesLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) mikrofonunu kapattı.`).setColor('RANDOM'))
});

client.on("voiceChannelUnmute", (member) => {
  client.channels.cache.get(sesLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) mikrofonunu açtı.`).setColor('RANDOM'))
});

client.on("voiceChannelDeaf", (member) => {
  client.channels.cache.get(sesLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) kulaklığını açtı.`).setColor('RANDOM'))
});

client.on("voiceChannelUndeaf", (member, deafType) => {
  client.channels.cache.get(sesLog).send(new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) kulaklığını kapattı.`).setColor('RANDOM'))
});

client.on("userAvatarUpdate", (member, oldAvatarURL, newAvatarURL) => {
  client.channels.cache.get(userAvatarLog).send(new Discord.MessageEmbed().setAuthor(member.tag, member.displayAvatarURL()).setDescription(`<@${member.id}> - (\`${member.id}\`) profil fotoğrafını güncelledi.\n\n Eski Avatar: [eski avatar](${oldAvatarURL}) \n Yeni Avatar: [yeni avatar](${newAvatarURL})`).setColor('RANDOM'))
});

client.login(config.token);
