// Load commands file for help system
const cmdList = require("../config/commands.json");

// Help Func
help(args, message)
{
    if (args.length == 0)
    {
        generalHelp(message);
    }
    else
    {
        getHelp(args, message);
    }
}

// Main Help Menu
function generalHelp(message)
{
  let hArray = new Array();
  for (var key in cmdList)
  {
    hArray.push(key);
  }
  message.author.send(topMenu + "Command List:\n\n " + hArray.toString().replace(/,/g, " ") + "\n\n" + botMenu);
}

// Help Sub-Menus
function getHelp(args, message)
{
  try {
    let arg1 = args[0];
    let arg2 = args[1];
    if (!isEmpty(arg1))
    {
      if (!isEmpty(cmdList[arg1]))
      {
        let example = cmdList[arg1]['example'];
        let desc = cmdList[arg1]['desc'];
        let cmdPerm = (message.member.permissions.has(cmdList[arg1]['perms']) ? "yes" : "no" );
        if (arg1.toString().toLowerCase() === 'set' && isEmpty(arg2))
        {
          let optionsArray = new Array();
          for(var key in cmdList['set']['options'])
          {
            optionsArray.push(key);
          }
          message.author.send(topMenu + "Command: " + arg1 + "\n\nSyntax: " + example + "\n\n" + "Description: " + desc + "\n\nOptions Available: " + optionsArray.toString().replace(/,/g, " ") + "\n\nFor more information on an option '**!help set <option>**'\n\nCan I use this? " + cmdPerm);
          return;
        }
        if (arg1.toString().toLowerCase() === 'set' && !isEmpty(arg2) && !isEmpty(cmdList[arg1]['options'][arg2]))
        {
          example = cmdList[arg1]['options'][arg2]['example'];
          desc = cmdList[arg1]['options'][arg2]['desc'];
          cmdPerm = (message.member.permissions.has(cmdList[arg1]['options'][arg2]['perms']) ? "yes" : "no" );
          message.author.send(topMenu + "Command: " + arg1 + " " + arg2 + "\n\nSyntax: " + example + "\n\n" + "Description: " + desc + "\n\nCan I use this? " + cmdPerm);
          return;
        }
        else
        {
          message.author.send(topMenu + "Command: " + arg1 + "\n\nSyntax: " + example + "\n\n" + "Description: " + desc + "\n\nCan I use this? " + cmdPerm);
          return;
        }
      }
      else
      {
          message.author.send(`[${config.appname}] Error: No such command. For a list of commands type '**!help**' with no arguments in any channel.`);
          return;
      }
    }
  }
  catch(error)
  {
    logIt(error.message, true);
  }
}