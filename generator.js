/* eslint-disable prefer-const */
/*
------------------------------------------------------------------------------------------------------------
    Copyright Felipe Sena | 2023 | Licenced under the GNU General Public Licence | Read the licence on the LICENCE.txt file | Node libraries might not have the same license as this file.
------------------------------------------------------------------------------------------------------------
*/
const fs = require('fs');
let json;

// Generate JSON
json = {
    'config': {
        'token': 'YOUR TOKEN',
        'testingToken': 'YOUR TOKEN',
        'apiNinjasKey': 'YOUR KEY',
        'virusTotal': 'YOUR KEY',
        'OwnerID': 'ID',
        'HelperID': 'ID',
        'targetID': 'UNUSED',
        'countChannel': 'ID',
        'countChannelDev': 'ID',
        'townspersonRole': 'ID',
        'countRole': 'ID',
        'generalChannelID': 'ID',
        'announcementsChannel': 'ID',
        'rulesChannel': 'ID',
        'questioningChannel': 'ID'
      },
      'channelsDev': [
        'CHANNEL NAME',
        'CHANNEL ID'
      ],
      'channels': [
        'CHANNEL NAME',
        'CHANNEL ID',
        'CHANNEL NAME',
        'CHANNEL ID',
        'CHANNEL NAME',
        'CHANNEL ID',
      ],
      'userInputHelp': {
        'quit': 'Closes the process',
        'sendMessage (channel) (message)': 'Sends a Discord message to the desired channel',
        'channelList': 'Displays all available channels to the client, those are mounted to the data.json file',
        'toggleCount': 'Toggles the count',
        'countStatus': 'Displays if the count is enabled or disabled'
      },
      'info': {
        'credits': 'Felipe Sena Costa: Coding\nSp00ketti: Additional help\nThe Swomp Server: Material for random videos and gifs\nOther people have also helped in the development of this bot, credit retroactively applies to the people who aided in the development of the original FelipeOS bot, but won\'t be named here for privacy reasons\nProudly uses Discord.js!',
        'commands': '-settings {setting} {true/false} = ADMIN ONLY! Allows the user to change bot settings\n-versionnumber = Returns the current version\n-credits = Shows credits and attributions\n-latestupdate = Shows patch notes\n-random {prompt} = Sends a message with the desired random content, it can be: cat, video, song and gif\n-bulkdel {int} = ADMIN ONLY! Deletes a set number of messages\n-rolecreate {name} {admin/normal} = ADMIN ONLY! Creates a new role\n-roledelete {name} = ADMIN ONLY! Deletes an existing role\n-ppsize = Dick size command (real)',
        'update': 'Major bot rewrite, focusing on code simplicity and readability, new features and performance; Major bug fix regarding disconnects.',
        'gitRepo': 'https://github.com/Felipe-Sena/FelipeOS2',
        'version': 'RELEASE|1.5.0'
      },
      'settings': {
        'logging': true,
        'susrandomresponse': true,
        'fchatresponses': false,
        'randomentertainment': true,
        'targeting': false,
        'count': true
      },
      'randomCountLossMessages': [
        'Laugh at this blunder!',
        'What a loser',
        'Bro did you drop out of primary school? YOU JUST HAVE TO COUNT',
        'What the fuck dude...',
        'Shit you\'re gonna make everyone leave... where\'s everyone going? Bingo?',
        'Why...',
        'YOU KNOW WHAT, YOU FUCKING LOSER, I. WILL. FUCK. YOUR. MOTHER.',
        'Get banned.',
        'You are a fucking dumbass!',
        'One and a two and a ... four?'
      ],
      'randomEntertainment': {
        'videos': [
          'https://www.youtube.com/watch?v=ymxEmbALjIo',
          'https://www.youtube.com/watch?v=pgDE2DOICuc',
          'https://cdn.discordapp.com/attachments/957379698919370823/1063182161961812038/trim.3915B701-5D08-44D1-9596-81F203876491.mov',
          'https://cdn.discordapp.com/attachments/957379698919370823/1063205921217589409/8aecfee8d92e72b5e74c24a4a3ca78aed805b825fc505aaa06f3e04e54e21556_1.mp4',
          'https://cdn.discordapp.com/attachments/957379698919370823/1063191418295812136/2578285745920722927.mp4',
          'https://cdn.discordapp.com/attachments/978647934428143676/1061961479139635260/trim.38662FE5-0EA7-4C50-A71F-C72CA5BA0407.mp4',
          'https://www.youtube.com/watch?v=6r13L1yvtYA',
          'https://www.youtube.com/watch?v=nBP4qnc58vM',
          'https://cdn.discordapp.com/attachments/1063602763382149182/1063611176128364585/v12044gd0000ceuhvb3c77u157upfo9g.mov',
          'https://cdn.discordapp.com/attachments/1063602763382149182/1063611291299741766/v09044g40000cerscj3c77ucr57cuabg.mov',
          'https://youtu.be/oFOmSv854Dw',
          'https://cdn.discordapp.com/attachments/904432494156320868/1077406479805583472/skill-issue-massive-skill-issue.mov',
          'https://cdn.discordapp.com/attachments/691438591829868617/1078151250392133743/IMG_2681.mp4',
          'https://media.discordapp.net/attachments/473062374400589828/1090646211440160859/Never_Go_To_Turkey_WTF_Is_This.mp4',
          'https://media.discordapp.net/attachments/717498714259980378/1090719541128069161/337146932_572686111325055_1655364989728372649_n.jpg',
          'https://cdn.discordapp.com/attachments/430421108236353562/1091020793934270464/It_sure_is_nice_driving_my_2020_Chevy_silverado.mp4',
          'https://media.discordapp.net/attachments/265540977500880898/1090789497110790244/romanian-2.mp4',
          'https://tenor.com/view/better-call-saul-chuck-mcgill-chicanery-breakdown-gif-25422432',
          'https://cdn.discordapp.com/attachments/473062374400589828/1091110603831115896/f6c784a6d1425b789db3b4534897d50e.png',
          'https://cdn.discordapp.com/attachments/1074926945676054598/1091136606783672320/togif-1-3.gif',
          'https://tenor.com/view/tekken-heihachi-laughing-gif-21122893',
          'https://media.discordapp.net/attachments/1074926945676054598/1089015477533155338/trim.2679FA63-CAF3-4943-8CEE-A04E7301744A.mov',
          'https://media.discordapp.net/attachments/1074926945676054598/1089012993301430313/20F9B240-F16B-4BEB-979C-B0A536E8B38D-27219-00000F0506165AB7.mp4',
          'https://media.discordapp.net/attachments/1074926945676054598/1089012993301430313/20F9B240-F16B-4BEB-979C-B0A536E8B38D-27219-00000F0506165AB7.mp4',
          'https://media.discordapp.net/attachments/1074926945676054598/1089017656889323600/video0_24.mp4',
          'https://media.discordapp.net/attachments/965119303420608542/1046132977345761411/trim.C2772638-7302-4285-B2E1-A5757920A5E9.mov',
          'https://cdn.discordapp.com/attachments/473062374400589828/1089000533819396106/Cute_lazy_eyed_cat_wants_chips.mp4',
          'https://cdn.discordapp.com/attachments/473062374400589828/1090161529082630198/GPU_not_gonna_overheat_today.mp4',
          'https://cdn.discordapp.com/attachments/888411047772442744/1089641259699806260/city_rats.mp4',
          'https://media.discordapp.net/attachments/473062374400589828/1090255485162229891/ShadowWillYouMarryme.mp4',
          'https://cdn.discordapp.com/attachments/734367490729050172/1088882150964723823/qyuvxo3z6npa1.mp4',
          'https://media.discordapp.net/attachments/473062374400589828/1088881509131354235/Nothing_like_a_mango_on_a_fork.mp4',
          'https://media.discordapp.net/attachments/473062374400589828/1088883383284813824/Aradaki_fark_bulun_kesfet_fyp.mp4',
          'https://media.discordapp.net/attachments/907266168174309488/1088693371817689168/20230323_000209.jpg',
          'https://media.discordapp.net/attachments/473062374400589828/1088875097143656518/pdGad7Dx7d7ON4Dv.mp4',
          'https://cdn.discordapp.com/attachments/1040722509026308186/1088860760333099121/337911412_228514529748390_3576447677329629082_n.mov',
          'https://cdn.discordapp.com/attachments/730990353703764058/1088581648272072775/AutoMemes.mov',
          'https://media.discordapp.net/attachments/1074926945676054598/1088328901706657802/kiracord20230320-323550-2k3er0.png',
          'https://media.discordapp.net/attachments/1069667540151844884/1087075411143434340/9sL9pk6aTTnbUzm4.mp4',
          'https://media.discordapp.net/attachments/473062374400589828/1086323529491939438/rFGMWNfQoLD9vexB.mp4'
        ],
        'images': [
          'https://cdn.discordapp.com/attachments/1063602763382149182/1063611185011904663/IMG_4316.jpg',
          'https://cdn.discordapp.com/attachments/1063602763382149182/1063611225902166046/B97BE33F-DA9E-4BB7-8B17-784028AF3050.jpg',
          'https://cdn.discordapp.com/attachments/1063602763382149182/1063611235817500793/IMG_4306.jpg',
          'https://cdn.discordapp.com/attachments/1063602763382149182/1063611240833880105/IMG_4305.jpg',
          'https://cdn.discordapp.com/attachments/1063602763382149182/1063611318785028156/Flq3R2dWYAgUsuJ.png',
          'https://cdn.discordapp.com/attachments/904432494156320868/1078157603227586610/image.png',
          'https://cdn.discordapp.com/attachments/904432494156320868/1077673256213028925/Screenshot_2023-01-04_201015.png',
          'https://cdn.discordapp.com/attachments/691438591829868617/1078356062282985592/Untitled3002_20230216130513.png'
        ],
        'gifs': [
          'https://tenor.com/view/troll-troll-face-gif-25116980',
          'https://tenor.com/view/aaron-likes-this-smile-gif-14781637',
          'https://tenor.com/view/middle-finger-flipping-off-dirty-finger-fu-cigarette-gif-17429778',
          'https://cdn.discordapp.com/attachments/1006667144555151390/1058494848430264330/17D8EE6C-A6E3-4801-9D01-81502106CF29.gif',
          'https://media.discordapp.net/attachments/929807268994744340/1038164611742060646/caption-8-2.gif',
          'https://media.discordapp.net/attachments/473062374400589828/1061416344781852672/7ca-1.gif',
          'https://tenor.com/view/crying-frustration-anger-black-guy-crying-sadness-gif-25630772',
          'https://tenor.com/view/sleep-gif-26114103'
        ],
        'music': [
          'https://open.spotify.com/track/7fGdAMx3QfPRkKRzj5cw0W?si=a7f6818031b244fb',
          'https://open.spotify.com/track/0OwvrdjaJOypNsNQHyBWE5?si=715f6943eb7c4501',
          'https://open.spotify.com/track/63mdLjCCOoSzxOBCJKoktB?si=c5087f3c85b94bfe'
        ]
      },
      'nrmTriggers': {
        'okTriggers': [
          'ok',
          'okay',
          'alright',
          'sure',
          'yes',
          'yep',
          'uh huh'
        ],
        'negativeTriggers': [
          'no',
          'negative',
          'nope',
          'nah',
          'nuh uh'
        ],
        'questions': [
          'what',
          'waht',
          'huh'
        ],
        'specialChars': [
          '!',
          '?',
          '.',
          ';'
        ]
      },
      'triggerResponses': [
        'GET CREATIVE AND FILL THIS UP!'
      ],
      'triggerWords': [
        'GET CREATIVE AND FILL THIS UP!'
      ]
}

// Generate the file structure
fs.mkdirSync('./json/backups', { recursive: true });

// Write json
fs.writeFileSync('./json/data.json', JSON.stringify(json, null, 2), (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('DATA file Written successfully');
    }
});

// Then write the count json

json = {
    'currentNumber': 0,
    'nextNumber': 1,
    'highscore': 0,
    'previousUserID': '',
    'channelID': 'COUNTCHANNEL'
}

fs.writeFileSync('./json/count.json', JSON.stringify(json, null, 2), (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('COUNT file Written successfully');
    }
});