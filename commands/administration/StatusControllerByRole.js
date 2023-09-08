const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('PartyControl')
        .setDescription('Сообщение для контроля участий рейда')
        .addRoleOption(option =>
            option.setName('Role')
            .setDescription('Роль контролируемого рейда')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('Title')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('Description'))
            .setDescription('Текст сообщения'),
    async execute(interaction) {

        const role = interaction.option.getRole('Role').id;
        const title = interaction.option.getString('Title');
        const desc = interaction.option.getString('Description');

        const members = await interaction.guild.members.fetch();
        members.sweep(user => !user.roles.cache.some(userRole => userRole.id === role));

        const membersStatus = {};
        const startMembersList = '';
        for (const member in members) {
            membersStatus[member.id] = 'ignore';
            startMembersList.concat(`<@${member.id}><br>`);
        }

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('success')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji({ name: '✅' }),

                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji({ name: '❌' }),

                new ButtonBuilder()
                    .setCustomId('maybe')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji({ name: '❓' }),
                new ButtonBuilder()
                    .setCustomId('delete')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji({ name: '🗑' }),
            );

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setFields(
                { name: 'success', inline: true },
                { name: 'cancel', inline: true },
                { name: 'maybe', inline: true },
                { name: 'ignore', value: startMembersList, inline: true },
            );

        const statusControllerMessage = await interaction.reply({ embed: [embed], components: [buttons] });

        const collector = await statusControllerMessage.createMessageComponentCollector();

        collector.on('collect', async (action) => {
            const buttonId = action.customId;

            if (buttonId === 'delete') { action.message.delete(); }
            else {
                const messageEmbed = action.message.embeds[0];
                const member = action.member.id;
                const memberNewStatus = buttonId;
                const memberOldStatus = membersStatus[member];

                for (let fieldIndex = 0; fieldIndex < messageEmbed.fields.length; fieldIndex++) {
                    switch (messageEmbed.fields[fieldIndex].name) {
                        case memberOldStatus:
                            messageEmbed.fields[fieldIndex].value.replace(`<@${member}><br>`, '');
                            break;
                        case memberNewStatus:
                            messageEmbed.fields[fieldIndex].value.concat(`<@${member}><br>`);
                            break;
                    }
                }
                action.message.edit({ embed: [messageEmbed], components: [buttons] })
                    .then(membersStatus[member] = memberNewStatus);
            }
        });
    },
};