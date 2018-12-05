// Debug Mode - gives me access by user id to certain commands while on
const debugMode = false;

// Developer ID - Set this to bypass all permissions checks for this user id. Set it 
// to letters (something it could never be) when not in use
const bypassId = '239948288135004162';

// Variables for random stuff
const topMenu = "\nHelp Menu <required> [optional]\n----------------------------------------------------\n";
const botMenu = "For more info on a command try: '**!help [command]**'";

// Anti-Spam Functions - Do not let users flood the bot/channel
var lastResponse = new Array ("Empty");
var spamTimeout = 600000;
    
// Load base, create a client connection, and load our configuration
const Discord = require("discord.js");
const client = new Discord.Client();

// Load config file
const config = require("./config.json");

// Load commands file for help system
const cmdList = require("./commands.json");

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
   
    // Kick a user from server
    if(command === "kick" || command === "k") {
      if(!perms.has("KICK_MEMBERS") || debugMode &&  message.author.id !== bypassId)
        return message.reply("Sorry, you don't have permissions to use this!");
      
      let member = message.mentions.members.first() || message.guild.members.get(args[0]);
      if(!member)
        return message.reply("Please mention a valid member of this server");
      if(!member.kickable) 
        return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
      
      let reason = args.slice(1).join(' ');
      if(!reason) reason = "No reason provided";
      
      await member.kick(reason)
        .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
      message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

    }
  
    // Ban a user from server
    if(command === "ban" || command === "b") {
      if(!perms.has("BAN_MEMBERS") || debugMode &&  message.author.id !== bypassId)
        return message.reply("Sorry, you don't have permissions to use this!");
    
      let member = message.mentions.members.first();
      if(!member)
        return message.reply("Please mention a valid member of this server");
      if(!member.bannable) 
        return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

      let reason = args.slice(1).join(' ');
      if(!reason) reason = "No reason provided";
    
      await member.ban(reason)
        .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
      message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
    }

    // Delete some number of previous lines in channel  
    if(command === "purge") {
      if(!perms.has("MANAGE_MESSAGES") || debugMode &&  message.author.id !== bypassId)
        return message.reply("Sorry, you don't have permissions to use this!");

      const deleteCount = parseInt(args[0], 10);
     
      if(!deleteCount || deleteCount < 2 || deleteCount > 100)
        return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

      const fetched = await message.channel.fetchMessages({limit: deleteCount});
      message.channel.bulkDelete(fetched)
        .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
    }
    if(command === "set") {
      if(!perms.has("ADMINISTRATOR") || debugMode &&  message.author.id !== bypassId)
        return message.reply("Sorry, you don't have permissions to use this!");
      
      if(args[0] != undefined) {
        if (args[0] === 'antispam') {
          if (args[1] != undefined && isNumeric(args[1])) {
            spamTimeout = args[1] * 60000;
            logIt("Anti-Spam timeout set to " + spamTimeout + " milliseconds.");
            message.reply("I have reset the anti-spam timeout to " + spamTimeout/60000 + " minutes.");
          } else {
            message.reply("The anti-spam timeout is " + spamTimeout/60000 + " minutes.");
          }
        }
      }
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

// Run the bot
client.login(config.token);
