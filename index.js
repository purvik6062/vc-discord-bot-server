const express = require('express');
const { Client, GatewayIntentBits, REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const app = express();

app.listen(5000, () => {
  console.log('Project is running!');
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers, // Enable GuildMembers intent
  ],
});

const commands = [
  {
    name: 'verify',
    description: 'Initiate the verification process.',
  },
];

const rest = new REST({ version: '9' }).setToken(process.env.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const getARoleChannel = client.channels.cache.get(process.env.GET_A_ROLE_CHANNEL_ID); // Replace with your channel ID

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'verify' && interaction.channelId === process.env.GET_A_ROLE_CHANNEL_ID) {
    interaction.reply({
      content: 'Please click the button below to verify your account.',
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 1,
              label: 'Verify',
              customId: 'verify-button',
            },
          ],
        },
      ],
    });
  } else {
    const getARoleChannel = client.channels.cache.get(process.env.GET_A_ROLE_CHANNEL_ID);

    if (getARoleChannel) {
      interaction.reply(`This command can only be used in the ${getARoleChannel.toString()} channel.`);
    } else {
      interaction.reply('This command can only be used in the #get-a-role channel.');
    }
  }
});


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId } = interaction;

  if (customId === 'verify-button') {
    await interaction.deferReply({ ephemeral: true }); // Defer the reply to ensure there are no errors

    // Send an embed with content
    await interaction.editReply({
      content: '',
      // content: 'You have been redirected to the verification page. [Click here to continue](' + process.env.VERIFICATION_URL + ')',
      embeds: [{
        title: 'Verification Page',
        description: 'To gain the VC-Holder role, you must first verify your verifiable credential. This process ensures that you are indeed a VC-Holder. Click the link below to start the verification:',
        color: 0x3498db,
        // fields: [
        //   {
        //     name: 'Verification Link',
        //     value: `[__Click here__](${process.env.VERIFICATION_URL})`,
        //     inline: true,
        //     customId: 'verify-link',
        //   },
        // ],
        thumbnail: {
          url: 'https://en.wikialpha.org/mediawiki/images/f/f9/Blue_Verified.png',
        },
        footer: {
          text: 'Verification System',
          icon_url: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png', // URL to the bot's icon
        },
      }],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: 'Continue',
              url: process.env.VERIFICATION_URL,
            },
          ],
        },
      ],
    });

    // Directly open the URL
    await interaction.member.send({
      content: `You have been redirected to the verification page. [Click here to continue](${process.env.VERIFICATION_URL})`,
    });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const role = guild.roles.cache.get(process.env.VC_HOLDER_ROLE_ID);

    if (role) {
      try {

        await interaction.followUp({
          content: `${interaction.member.user.tag} is successfully verified. Assigned the VC-Holder role.`,
        });
        console.log("Adding role in process!")
        await interaction.member.roles.add(role);
        console.log(`Added role ${role.name} to ${interaction.member.user.tag}`);
      } catch (error) {
        console.error(`Error adding role to member: ${error.message}`);
      }
    } else {
      console.error(`Role with ID ${process.env.VC_HOLDER_ROLE_ID} not found`);
    }
  }
});



// client.on('interactionCreate', async (interaction) => {
//   if (!interaction.isButton()) return;

//   const { label } = interaction;

//   if (label === 'Continue') {
//     await interaction.deferReply({ ephemeral: true }); // Defer the reply to ensure there are no errors

//     await interaction.editReply({
//       content: `${interaction.member.user.tag} is successfully verified. Assigned the VC-Holder role.`,
//     });

//     const guild = client.guilds.cache.get(process.env.GUILD_ID);
//     const role = guild.roles.cache.get(process.env.VC_HOLDER_ROLE_ID);

//     if (role) {
//       try {
//         // await interaction.followUp({
//         //   content: `${interaction.member.user.tag} is successfully verified. Assigned the VC-Holder role.`,
//         // });
//         console.log("Adding role in process!")
//         await interaction.member.roles.add(role);
//         console.log(`Added role ${role.name} to ${interaction.member.user.tag}`);
//       } catch (error) {
//         console.error(`Error adding role to member: ${error.message}`);
//       }
//     } else {
//       console.error(`Role with ID ${process.env.VC_HOLDER_ROLE_ID} not found`);
//     }
//   }
// });



client.login(process.env.token);
