# FELIPEOS² - INTRODUCTION

FELIPEOS² is a versatile Discord bot licensed under the GPL 3.0 license.  
Hopefully this document will help you in setting the bot up, ideally there will be a "generic" version that will have easier set-up instructions. But before I show you how to make this work I'd like to credit the libraries used:
| Library | Use |
| ----------- | ----------- |
| discordJS| Framework the bot is built on |
| chalk | Used for color-coding logs |
| undici | Used for managing web requests |

**You should also install NodeJS**

# FELIPEOS² - FILES
FELIPEOS² works with two important files, those being `data.json` and `count.json`.  
`data.json` is where everything that the bot will use is stored, so those may be API keys, images, channel aliases (used for the command-line interface), etc...  
Setting it up shouldn't be too much of a problem if you use the `generator.js` file, but I'll explain what some of the keys in the JSON file do:

```JSON
"config": {
    "token": "DISCORDTOKEN",
    "testingToken": "ALTERNATE DISCORD TOKEN",
    "apiNinjasKey": "API",
    "virusTotal": "API (UNUSED)",
    "OwnerID": "YOUR DISCORD ID",
    "HelperID": "A FRIEND'S / TRUSTED PERSON'S ID",
    "targetID": "UNUSED",
    "countChannel": "A CHANNEL ID FOR A COUNT CHANNEL",
    "countChannelDev": "A CHANNEL ID FOR A COUNT CHANNEL (TESTING)",
    "townspersonRole": "SPECIFIC TO A SERVER, PUT THE DEFAULT SERVER ROLE HERE",
    "countRole": "THE ROLE THAT ALLOWS PEOPLE TO COUNT",
    "generalChannelID": "THE MAIN CHANNEL ID",
    "announcementsChannel": "THE ANNOUNCEMENTS CHANNEL ID",
    "rulesChannel": "THE RULES CHANNEL ID",
    "questioningChannel": "SPECIFIC TO A SERVER, USED FOR QUESTIONING PEOPLE BEFORE BANNING THEM (ID)"
  }
```
Config is where the things that are most needed for the bot to work are stored, it is worth pointing out that this bot was custom-made for a specific server, so things like `countChannel` or `questioningChannel` might not apply to your use case. Changing these would require code changes which are going to be explained in the `codechanges.md` file. Make sure to fill in every key here except for `targetID`.  
As of writing `virusTotal` is not implemented.
```JSON
"channelsDev": [
    "CHANNEL NAME",
    "CHANNEL ID"
  ],
"channels": [
    "CHANNEL NAME",
    "CHANNEL ID",
    "CHANNEL NAME",
    "CHANNEL ID",
    "CHANNEL NAME",
    "CHANNEL ID",
    "CHANNEL NAME",
    "CHANNEL ID"
  ]
```
These are used for the `sendMessage` command (CLI). This command allow you to send a message to one of the channels in the `data.json` file from the command-line.  
They're organized in a way that makes the channel ID's always have an even index when starting from 0, so always follow the order showcased in this example.  
It is worth noting that you may not have a separate server dedicated for testing your bot, so you may not need it, removing it manually will be discussed in the `codechanges.md` file.  
The rest are pretty self explanatory, with some being used for the `random` command.  
The last ones worth noting are these:
```JSON
"triggerResponses": [
    //things to respond to triggered messages
],
"triggerWords": [
    //words to trigger the filter here
]
```
These are used as a little inside joke for the server this was created for, and generating these in their original form will yield NSFW results, an example for how this would work will be shown below where the word in bold will be the one that will trigger the response:  

>User: Damn that's **nuts**  
>Bot: ![dog](https://media.discordapp.net/attachments/691438591829868617/1071271705542135808/majimer.gif)  

You will be given a choice on how to generate this part of the JSON file when running the `generator.js` file.  
# FELIPEOS² - COUNT
The count is a simple process, assign a channel ID for the count channel and a role ID for the count role. Counting works like the example below:

>Felipe: 1  
>Otheruser: 2  
>Felipe: 3  
>Otheruser: 5  
>Bot: Otheruser ruined it! Laugh at thig man  
>highscore: 3

Pretty simple. The `count.json` file is structured like this:

```JSON
{
"currentNumber": 0,
"nextNumber": 1,
"highscore": 10,
"previousUserID": "",
"channelID": "COUNTCHANNEL"
}
```

# FELIPEOS² - License

This program is licensed under the GPL 3.0 license, you can read it in the `LICENSE.TXT` file. If you don't want to read it I've included a short summary below of what you can, must and shouldn't do.  

## GNU GPL SUMMARY

You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.

| CAN | CANNOT | MUST |
| ----------- | ----------- | ----------- |
| Use for commercial purposes | Sublicense | Include the original files |
| Modify the software | Hold the software / license owner liable for damages  | State significant changes made to the software |
| Distribute the original or modified work | | Disclose the source code when distributed |
| Place warranty on the software when licensed | | Include the full text of the license in the modified software |
| Place a patent claim of contributors to the code | | Include the original copyright |
| | | Include install / build instructions |

# TODO

- [x] Write README.md
- [x] Finish bot rewrite
- [x] Implement generator.js
- [] Document source code modifications for removing `data.json` parameters
- [] Write a "generic" branch
- [] Implement voice channel commands
- [] Implement "fbot like" chat interaction
