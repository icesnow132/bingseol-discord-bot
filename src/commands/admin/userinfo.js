const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Display information about a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to look up (defaults to yourself)')
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(targetUser.id);

    const accountCreated = `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`;
    const joinedServer = member
      ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
      : 'Not in server';

    const roles = member
      ? member.roles.cache
          .filter((r) => r.id !== interaction.guild.id)
          .sort((a, b) => b.position - a.position)
          .map((r) => r.toString())
          .slice(0, 10)
          .join(', ') || 'None'
      : 'N/A';

    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor || 0x3498db)
      .setTitle(`👤 ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 User ID', value: targetUser.id, inline: true },
        { name: '🤖 Bot', value: targetUser.bot ? 'Yes' : 'No', inline: true },
        { name: '📅 Account Created', value: accountCreated, inline: false },
        { name: '📥 Joined Server', value: joinedServer, inline: false },
        { name: '🎭 Roles', value: roles, inline: false }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    if (member?.nickname) {
      embed.spliceFields(1, 0, { name: '📛 Nickname', value: member.nickname, inline: true });
    }

    return interaction.reply({ embeds: [embed] });
  },
};
