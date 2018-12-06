// Load config file
const config = require("./config/config.json");

// Import HTTP libs
const http = require('http');

// Load commands file for help system
const cmdList = require("./config/commands.json");

// Debug Mode - gives me access by user id to certain commands while on
const debugMode = false;

// Developer ID - Set this to bypass all permissions checks for this user id. Set it 
// to letters (something it could never be) when not in use
const bypassId = config.owner_id;

logIt(`DiscordBot ${config.version} starting up with owner ${config.owner_id}.`);

getUrl( "abc" );

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
    if(command === "help") {
      if (args.length == 0) {
        generalHelp(message);
      } else {
        getHelp(args, message, perms);
      }
    }

    // Display our version. For development purposes
    if(command === "version") {
      message.channel.send("[MQ2Bot] - Version " + (config.version));
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

  } else {
    // Auto-Reponse Text We're Listening For
    // ETA on compiles
  try {
    if(!lastResponse.contains("eta") && message.content.toLowerCase().includes("eta") && message.content.toLowerCase().includes("compile")) {
      message.reply(`The ETA for a compile is generally before or at 8PM EST for minor patches. For larger updates this time may be extended.`);
      lastResponse.push("eta");
      setTimeout(arrayRemove, spamTimeout, lastResponse, "eta");
      return;
    } else {
      return;
    }
  }
  catch(error) {
    logIt(error.message, true);
  }
  }
})

// Prototype Extensions
// Does an array contain an item?
Array.prototype.contains = function(obj) {
    return this.indexOf(obj) > -1;
};

// Remove all instances of an item from an array
Array.prototype.remove = function(item) {
    for (var i = this.length; i--;) {
        if (this[i] === item) {
            this.splice(i, 1);
        }
    }
}

// Functions

// Log certain items or errors
function logIt(message, isError = false) {
  if (!isError) {
    console.log("[MQ2Bot] " + displayTime() + "> " + message);
  } else {
    console.error("[MQ2Bot] " + displayTime() + "> " + message);
  }
}

// Format Timestamps
function displayTime() {
    var str = "";
    var currentTime = new Date()
    var hours = currentTime.getHours()
    var minutes = currentTime.getMinutes()
    var seconds = currentTime.getSeconds()
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    if (seconds < 10) {
        seconds = "0" + seconds
    }
    str += hours + ":" + minutes + ":" + seconds + " ";
    if(hours > 11){
        str += "PM"
    } else {
        str += "AM"
    }
    return str;
}

// Remove item from array when callback is needed.
function arrayRemove(arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] === item) {
            arr.splice(i, 1);
            logIt("Removed " + item + " from " + arr + " array at index [" + i + "]");
        }
    }
}

// Is passed variable a number?
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// Is passed variable or array empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


// Main Help Menu
function generalHelp(message) {
  let hArray = new Array();
  for (var key in cmdList) {
    hArray.push(key);
  }
  message.author.send(topMenu + "Command List:\n\n " + hArray.toString().replace(/,/g, " ") + "\n\n" + botMenu);
}

// Help Sub-Menus
function getHelp(args, message) {
  try {
    let arg1 = args[0];
    let arg2 = args[1];
    if (!isEmpty(arg1)) {
      if (!isEmpty(cmdList[arg1])) {
        let example = cmdList[arg1]['example'];
        let desc = cmdList[arg1]['desc'];
        let cmdPerm = (message.member.permissions.has(cmdList[arg1]['perms']) ? "yes" : "no" );
        if (arg1.toString().toLowerCase() === 'set' && isEmpty(arg2)) {
          let optionsArray = new Array();
          for(var key in cmdList['set']['options']) {
            optionsArray.push(key);
          }
          message.author.send(topMenu + "Command: " + arg1 + "\n\nSyntax: " + example + "\n\n" + "Description: " + desc + "\n\nOptions Available: " + optionsArray.toString().replace(/,/g, " ") + "\n\nFor more information on an option '**!help set <option>**'\n\nCan I use this? " + cmdPerm);
          return;
        }
        if (arg1.toString().toLowerCase() === 'set' && !isEmpty(arg2) && !isEmpty(cmdList[arg1]['options'][arg2])) {
          example = cmdList[arg1]['options'][arg2]['example'];
          desc = cmdList[arg1]['options'][arg2]['desc'];
          cmdPerm = (message.member.permissions.has(cmdList[arg1]['options'][arg2]['perms']) ? "yes" : "no" );
          message.author.send(topMenu + "Command: " + arg1 + " " + arg2 + "\n\nSyntax: " + example + "\n\n" + "Description: " + desc + "\n\nCan I use this? " + cmdPerm);
          return;
        } else {
          message.author.send(topMenu + "Command: " + arg1 + "\n\nSyntax: " + example + "\n\n" + "Description: " + desc + "\n\nCan I use this? " + cmdPerm);
          return;
        }
      } else {
          message.author.send(`[MQ2Bot] Error: No such command. For a list of commands type '**!help**' with no arguments in any channel.`);
          return;
      }
    }
  }
  catch(error) {
    logIt(error.message, true);
  }
}

function getUrl( url )
{
    var request = http.request( { host: 'streamdecker.com', path: '/decks/legenvd' }, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            console.log(data);

        });
    });

    request.on('error', function (e) {
        console.log(e.message);
    });

    request.end();
}

// Run the bot
client.login(config.token);
