const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song'),

  async execute(interaction) {
    const queue = interaction.client.musicQueues.get(interaction.guildId);

    if (!queue || !queue.player) {
      return interaction.reply({ content: '❌ There is nothing playing right now.', ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '🔇 You must be in a voice channel!', ephemeral: true });
    }

    if (queue.player.state.status === AudioPlayerStatus.Paused) {
      return interaction.reply({ content: '⏸️ The music is already paused. Use `/resume` to continue.', ephemeral: true });
    }

    queue.player.pause();

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('⏸️ Paused')
      .setDescription(`Paused **${queue.songs[0]?.title || 'current song'}**`)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
