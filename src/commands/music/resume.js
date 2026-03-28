const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  async execute(interaction) {
    const queue = interaction.client.musicQueues.get(interaction.guildId);

    if (!queue || !queue.player) {
      return interaction.reply({ content: '❌ There is nothing paused right now.', ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '🔇 You must be in a voice channel!', ephemeral: true });
    }

    if (queue.player.state.status !== AudioPlayerStatus.Paused) {
      return interaction.reply({ content: '▶️ The music is not paused.', ephemeral: true });
    }

    queue.player.unpause();

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('▶️ Resumed')
      .setDescription(`Resumed **${queue.songs[0]?.title || 'current song'}**`)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
