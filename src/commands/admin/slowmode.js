const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for the current or specified channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((option) =>
      option
        .setName('seconds')
        .setDescription('Slowmode delay in seconds (0 to disable, max 21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .addChannelOption((option) =>
      option.setName('channel').setDescription('Channel to apply slowmode to (defaults to current)')
    ),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: '❌ Slowmode can only be set on text channels.', ephemeral: true });
    }

    try {
      await channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('🐢 Slowmode Updated')
        .setDescription(
          seconds === 0
            ? `Slowmode disabled in ${channel}.`
            : `Slowmode set to **${seconds} second(s)** in ${channel}.`
        )
        .addFields({ name: 'Set by', value: interaction.user.tag, inline: true })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Slowmode error:', err);
      return interaction.reply({ content: '❌ Failed to update slowmode.', ephemeral: true });
    }
  },
};
