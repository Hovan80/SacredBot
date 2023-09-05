const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('Parti_control')
        .setDescription('Сообщение для контроля участий рейда')
        .addRoleOption(option =>
            option.setName('Role')
            .setDescription('Роль рейда')
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
            startMembersList.concat(`${member.id}<br>`);
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

        await interaction.reply({ embed: [embed], components: [buttons] });

        const collector = await interaction.message.createMessageComponentCollector();

        collector.on('collect', async (action) => {
            const buttonId = action.customId;

            if (buttonId === 'delete') { action.message.delete(); }
            else {
                const messageEmbed = action.message.embeds[0];
                const member = action.member.id;

                for (let fieldIndex = 0; fieldIndex < messageEmbed.fields.length; fieldIndex++) {
                    if (messageEmbed.fields[fieldIndex].name === membersStatus[member]) {
                        messageEmbed.fields[fieldIndex].value.replace(`${member}<br>`);
                        break;
                    }
                }
                for ()
            }
        });
    },
};

// По кнопке участник добавляется в определую колонку (Иду, не иду, не знаю). Удаление участника из колонки происходит по его статутсу. Для этого определяется статус участника,
// далее по статусу определяется его колонка (Название статусов участников и name колонок должны совпадать). Из колонки происходит удаление участника (предположительно
// колонка является строкой), после статус участника изменяется и участник записывается в новую колонку