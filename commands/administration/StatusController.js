const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('statuscontroller')
        .setDescription('Сообщение для контроля участий рейда')
        .addRoleOption(option =>
            option.setName('role')
            .setDescription('Роль контролируемого рейда')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
            .setDescription('Заголовок сообщения')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
            .setDescription('Текст сообщения')),
    async execute(interaction) {
        const raidRole = interaction.options.getRole('role').id;
        const title = interaction.options.getString('title');
        const desc = interaction.options.getString('description');

        const raidMembers = await interaction.guild.members.fetch();
        raidMembers.sweep(member => !(member._roles.includes(raidRole)));

        let startMembersList = '\u200b';
        raidMembers.each(member => {
            member.status = 'ignore';
            startMembersList += `<@${member.id}>`;
        });

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
                { name: 'success', value: '\u200b', inline: true },
                { name: 'cancel', value: '\u200b', inline: true },
                { name: 'maybe', value: '\u200b', inline: true },
                { name: 'ignore', value: startMembersList, inline: true },
            );

        const statusControllerMessage = await interaction.channel.send({ embeds: [embed], components: [buttons] });

        const collector = await statusControllerMessage.createMessageComponentCollector();

        collector.on('collect', async (action) => {
            const buttonId = action.customId;

            if (buttonId === 'delete') { action.message.delete(); }
            else {
                if (!(action.member._roles.includes(raidRole))) {
                    return action.reply({ content: 'Недостаточно прав', ephemeral: true });
                }
                const newEmbed = EmbedBuilder.from(action.message.embeds[0]);
                const memberId = action.member.id;
                const memberNewStatus = buttonId;
                const memberOldStatus = raidMembers.get(memberId).status;

                for (let fieldIndex = 0; fieldIndex < newEmbed.data.fields.length; fieldIndex++) {
                    switch (newEmbed.data.fields[fieldIndex].name) {
                        case memberOldStatus:
                            newEmbed.data.fields[fieldIndex].value = newEmbed.data.fields[fieldIndex].value.replace(`<@${memberId}>`, '');
                            break;
                        case memberNewStatus:
                            newEmbed.data.fields[fieldIndex].value = newEmbed.data.fields[fieldIndex].value.concat(`<@${memberId}>`);
                            break;
                    }
                }
                action.message.edit({ embeds: [newEmbed], components: [buttons] })
                    .then(raidMembers.get(memberId).status = memberNewStatus);
            }
        });

    },
};