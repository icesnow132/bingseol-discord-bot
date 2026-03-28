const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggle loop mode for the queue'),

  async execute(interaction) {
    const queue = interaction.client.musicQueues.get(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return interaction.reply({ content: '❌ There is nothing playing right now.', ephemeral: true });
    }

    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '🔇 You must be in a voice channel!', ephemeral: true });
    }

    queue.looping = !queue.looping;

    const embed = new EmbedBuilder()
      .setColor(queue.looping ? 0x2ecc71 : 0xe74c3c)
      .setTitle(queue.looping ? '🔁 Loop Enabled' : '🔁 Loop Disabled')
      .setDescription(queue.looping ? 'The queue will now repeat.' : 'The queue will no longer repeat.')
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
