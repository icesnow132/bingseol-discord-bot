const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing song'),

  async execute(interaction) {
    const queue = interaction.client.musicQueues.get(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return interaction.reply({ content: '❌ There is nothing playing right now.', ephemeral: true });
    }

    const song = queue.songs[0];

    const embed = new EmbedBuilder()
      .setColor(0x1db954)
      .setTitle('🎵 Now Playing')
      .setDescription(`[${song.title}](${song.url})`)
      .addFields(
        { name: 'Duration', value: song.duration || 'Unknown', inline: true },
        { name: 'Requested by', value: song.requestedBy, inline: true },
        { name: 'Loop', value: queue.looping ? '🔁 On' : '❌ Off', inline: true }
      )
      .setThumbnail(song.thumbnail || null)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
