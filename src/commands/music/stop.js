const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and disconnect the bot from voice'),

  async execute(interaction) {
    const queue = interaction.client.musicQueues.get(interaction.guildId);

    if (!queue || !queue.connection) {
      return interaction.reply({ content: '❌ The bot is not in a voice channel.', ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '🔇 You must be in a voice channel to stop the music!', ephemeral: true });
    }

    queue.songs = [];
    queue.looping = false;
    queue.player.stop(true);
    queue.connection.destroy();
    interaction.client.musicQueues.delete(interaction.guildId);

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('⏹️ Stopped')
      .setDescription('Music stopped and disconnected from voice channel.')
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
