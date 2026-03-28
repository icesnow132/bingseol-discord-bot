const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot latency'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor(wsLatency < 100 ? 0x2ecc71 : wsLatency < 200 ? 0xf39c12 : 0xe74c3c)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: '📡 Roundtrip Latency', value: `${roundtrip}ms`, inline: true },
        { name: '💓 WebSocket Heartbeat', value: `${wsLatency}ms`, inline: true }
      )
      .setTimestamp();

    return interaction.editReply({ content: '', embeds: [embed] });
  },
};
