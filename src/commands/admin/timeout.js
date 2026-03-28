const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout (mute) a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('User to timeout').setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('duration')
        .setDescription('Timeout duration in minutes (1-40320 / 28 days)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for timeout')
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const durationMinutes = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot timeout yourself.', ephemeral: true });
    }

    if (!target.moderatable) {
      return interaction.reply({ content: '❌ I cannot timeout this user. They may have a higher role than me.', ephemeral: true });
    }

    if (
      target.roles.highest.position >= interaction.member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      return interaction.reply({ content: '❌ You cannot timeout someone with an equal or higher role.', ephemeral: true });
    }

    const durationMs = durationMinutes * 60 * 1000;

    try {
      await target.timeout(durationMs, reason);

      const durationStr =
        durationMinutes >= 1440
          ? `${Math.floor(durationMinutes / 1440)} day(s)`
          : durationMinutes >= 60
            ? `${Math.floor(durationMinutes / 60)} hour(s)`
            : `${durationMinutes} minute(s)`;

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('🔇 Member Timed Out')
        .addFields(
          { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Duration', value: durationStr, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Timeout error:', err);
      return interaction.reply({ content: '❌ Failed to timeout the user.', ephemeral: true });
    }
  },
};
