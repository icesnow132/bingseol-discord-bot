const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((option) =>
      option.setName('user_id').setDescription('User ID to unban').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for unban')
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({ content: '❌ Please provide a valid Discord user ID.', ephemeral: true });
    }

    try {
      const banEntry = await interaction.guild.bans.fetch(userId).catch(() => null);
      if (!banEntry) {
        return interaction.reply({ content: '❌ This user is not banned.', ephemeral: true });
      }

      await interaction.guild.members.unban(userId, reason);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ User Unbanned')
        .addFields(
          { name: 'User', value: `${banEntry.user.tag} (${userId})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Unban error:', err);
      return interaction.reply({ content: '❌ Failed to unban the user. Please check the user ID.', ephemeral: true });
    }
  },
};
