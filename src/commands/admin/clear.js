const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a number of messages from the channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption((option) =>
      option.setName('user').setDescription('Only delete messages from this user')
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const filterUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await interaction.channel.messages.fetch({ limit: 100 });

      if (filterUser) {
        messages = messages.filter((m) => m.author.id === filterUser.id);
      }

      // Discard messages older than 14 days (Discord API limitation)
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      messages = messages.filter((m) => m.createdTimestamp > twoWeeksAgo);

      const toDelete = [...messages.values()].slice(0, amount);

      if (toDelete.length === 0) {
        return interaction.editReply('❌ No eligible messages found to delete. Messages older than 14 days cannot be bulk deleted.');
      }

      const deleted = await interaction.channel.bulkDelete(toDelete, true);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('🗑️ Messages Cleared')
        .addFields(
          { name: 'Deleted', value: `${deleted.size} message(s)`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Filter', value: filterUser ? filterUser.tag : 'None', inline: true }
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Clear error:', err);
      return interaction.editReply('❌ Failed to delete messages.');
    }
  },
};
