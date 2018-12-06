// include helpers
include( 'bot_helpers.js' );
include( 'commands.js' );

// Load config file
const config = require("../config/config.json");

// Import HTTP libs
const http = require('http');

// Debug Mode - gives me access by user id to certain commands while on
const debugMode = config.debugMode;

// Developer ID - Set this to bypass all permissions checks for this user id. Set it 
// to letters (something it could never be) when not in use
const bypassId = config.owner_id;

logIt(`DiscordBot ${config.version} starting up with owner ${config.owner_id}.`);

// Variables for random stuff
const topMenu = "\nHelp Menu <required> [optional]\n----------------------------------------------------\n";
const botMenu = "For more info on a command try: '**!help [command]**'";

// Anti-Spam Functions - Do not let users flood the bot/channel
var lastResponse = new Array ("Empty");
var spamTimeout = 600000;
    
// Load base, create a client connection, and load our configuration
const Discord = require("discord.js");
const client = new Discord.Client();

// Perform on connect/disconnect
client.on("ready", () => {
  logIt(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} servers.`); 
  client.user.setActivity(`EverQuest`);
});

client.on("guildCreate", guild => {
  logIt(`New server joined: ${guild.name} (id: ${guild.id}). This server has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
  logIt(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

// Listen for commands
client.on("message", async message => {
  // Ignore ourself
  if(message.author.bot) return;

  // Only listen for commands in public channels.
  if(message.channel.name == undefined) return;

  // Look for command character. Else ignore command checking.
  if(message.content.indexOf(config.prefix) == 0) {
    let perms = message.member.permissions;
  
    // Separate command and arguments.
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
  
    // Help Menu
    if(command === "help")
    {
        //call cmdList.help.func();
    }

    // Display our version. For development purposes
    if(command === "version") {
      message.channel.send(`[${config.appname}] - Version ` + (config.version));
    }
  
    // Check Bot Latency to Discord
    if(command === "ping") {
      const m = await message.channel.send("Ping?");
      m.edit(`Pong! Lag: ${m.createdTimestamp - message.createdTimestamp}ms`);
    }
    
    // Make the bot talk
    if(command === "say") {
      if(!perms.has("MANAGE_MESSAGES") || debugMode &&  message.author.id !== bypassId)
        return message.reply("Sorry, you don't have permissions to use this!");

      const sayMessage = args.join(" ");
      message.delete().catch(O_o=>{}); 
      message.channel.send(sayMessage);
    }

  }
  else
  {
        // Auto-Reponse Text We're Listening For
        // ETA on compiles
        try
        {
            if(!lastResponse.contains("eta") && message.content.toLowerCase().includes("eta") && message.content.toLowerCase().includes("compile"))
            {
                message.reply(`The ETA for a compile is generally before or at 8PM EST for minor patches. For larger updates this time may be extended.`);
                lastResponse.push("eta");
                setTimeout(arrayRemove, spamTimeout, lastResponse, "eta");
                return;
            }
            else
            {
              return;
            }
        }
        catch(error)
        {
            logIt(error.message, true);
        }
  }
})

// Run the bot
client.login(config.token);
