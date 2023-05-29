require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setActivity({
    name: 'BOT',              //Custom status, change ''bot'' for anything you want. 
    type: ActivityType.Playing,
  })
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith('!')) return; //prefix to make the bot IGNORE a message, use this to talk normaly without bot response.

  const allowedChannels = [process.env.CHANNEL_ID_1, process.env.CHANNEL_ID_2, process.env.CHANNEL_ID_TEST]; //see '.env' for more about this.
  if (!allowedChannels.includes(message.channel.id)) return;

  const content = message.content.trim();
  if (!content.startsWith('?')) return; //This prefix is to start a conversation with the bot, i recomend using a name for the bot or a dot since the bot takes '?' as a question.
  
  try {
    let channel = message.channel;
    let logs = await channel.messages.fetch({ limit: 25 });
    console.log(logs);

    const channelMessages = await message.channel.messages.fetch({ limit: 15 }); // Fetch the last 15 messages in the channel
    const userMessages = channelMessages.filter(msg => msg.author.id === message.author.id); // Filter messages sent by the same user

    const conversationLog = [ 
      { role: 'system', content: 'You are a helpful assistant.' },  //<<<<<<<<< Personality check, it can be a lot of things, like 'a sarcastic assistant/bot' or a sad bot, etc.
      { role: 'user', content: 'Only respond to me in playful ways; while still being helpful and giving examples if you need to.'},
      { role: 'user', content: message.content },
    ];

    try {
      await message.channel.sendTyping();
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo', //Chatgpt bot model
        messages: conversationLog,
        temperature: 1.3, //it sets how much of the personalityCheck the bot will use, if they are too much ''into it'' lower to 0.3 ~ 0.7
      });

      const reply = response.data.choices[0].message.content.trim();
      message.reply(reply);
    } catch (error) {
      console.log(`ERR: ${error}`);
    }
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.TOKEN);
