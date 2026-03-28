const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('❄️ BingSeol Bot — Help')
      .setDescription('Here is a list of all available commands:')
      .addFields(
        {
          name: '🎵 Music',
          value: [
            '`/play <query>` — Play a song from YouTube',
            '`/skip` — Skip the current song',
            '`/stop` — Stop music and disconnect',
            '`/pause` — Pause the current song',
            '`/resume` — Resume the paused song',
            '`/queue [page]` — Show the music queue',
            '`/nowplaying` — Show the current song',
            '`/loop` — Toggle loop mode',
          ].join('\n'),
        },
        {
          name: '🔊 TTS (Text-to-Speech)',
          value: ['`/tts <text> [language]` — Speak text in a voice channel'].join('\n'),
        },
        {
          name: '⚙️ Server Management',
          value: [
            '`/kick <user> [reason]` — Kick a member',
            '`/ban <user> [reason] [days]` — Ban a member',
            '`/unban <user_id> [reason]` — Unban a user',
            '`/timeout <user> <duration> [reason]` — Timeout a member',
            '`/clear <amount> [user]` — Delete messages',
            '`/slowmode <seconds> [channel]` — Set channel slowmode',
            '`/serverinfo` — Server information',
            '`/userinfo [user]` — User information',
            '`/ping` — Bot latency',
          ].join('\n'),
        }
      )
      .setFooter({ text: 'BingSeol Bot • Fast, stable, and easy to use' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
