const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),

  async execute(interaction) {
    const queue = interaction.client.musicQueues.get(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return interaction.reply({ content: '❌ There is nothing playing right now.', ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '🔇 You must be in a voice channel to skip!', ephemeral: true });
    }

    const skipped = queue.songs[0];
    queue.player.stop();

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('⏭️ Skipped')
      .setDescription(`Skipped **${skipped.title}**`)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
