const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue')
    .addIntegerOption((option) =>
      option.setName('page').setDescription('Page number').setMinValue(1)
    ),

  async execute(interaction) {
    const queue = interaction.client.musicQueues.get(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return interaction.reply({ content: '📭 The queue is empty.', ephemeral: true });
    }

    const page = interaction.options.getInteger('page') || 1;
    const pageSize = 10;
    const totalPages = Math.ceil(queue.songs.length / pageSize);

    if (page > totalPages) {
      return interaction.reply({ content: `❌ Page ${page} does not exist. There are only ${totalPages} page(s).`, ephemeral: true });
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const songs = queue.songs.slice(start, end);

    const description = songs
      .map((song, i) => {
        const index = start + i;
        const prefix = index === 0 ? '🎵 **Now Playing:**' : `\`${index}.\``;
        return `${prefix} [${song.title}](${song.url}) \`${song.duration || '?'}\` — *${song.requestedBy}*`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`📋 Music Queue — ${queue.songs.length} song(s)`)
      .setDescription(description)
      .setFooter({ text: `Page ${page}/${totalPages} • Loop: ${queue.looping ? '🔁 On' : '❌ Off'}` })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
