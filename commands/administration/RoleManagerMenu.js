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

        const role = interaction.option.getRole('Role');
        const title = interaction.option.getString('Title');
        const desc = interaction.option.getString('Description');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setFields(
                { name: 'Идут: ', inline: true },
                { name: 'Не идут:', inline: true },
                { name: 'Под вопросом:', inline: true },
                { name: 'Не прожались', inline: true },
            );
    },
};