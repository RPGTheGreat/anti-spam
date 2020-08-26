
  if(isNaN(limitUntilWarn)) throw new Error("ERROR: <limitUntilWarn> option is not set up right! Please check it again to be a number in settings.");
  if(isNaN(limitUntilMuted)) throw new Error("ERROR: <limitUntilMuted> option is not set up right! Please add a number in settings.");
  if(isNaN(interval)) throw new Error("ERROR: <interval> option is not set up right! Please add a number in settings.");
  if(!isNaN(warningMessage) || warningMessage.length < 5) throw new Error("ERROR: <warningMessage> option must be a string and have at least 5 characters long (Including space).");
  if(!isNaN(muteMessage) || muteMessage.length < 5) throw new Error("ERROR: <muteMessage> option must be a string and have at least 5 characters long (Including space).");
  if(isNaN(maxDuplicatesWarning)) throw new Error("ERROR: <maxDuplicatesWarning> option is not set up right! Please check it again to be a number in settings.")
  if(isNaN(maxDuplicatesMute)) throw new Error("ERROR: <maxDuplicatesMute> option is not set up right! Please check it again to be a number in settings.");
  if(isNaN(timeMuted)) throw new Error("ERROR: <timeMuted> option is not set up right! Please check it again to be a number in settings.");
  if(ignoredRoles.constructor !== Array) throw new Error("ERROR: <ignoredRoles> option is not set up right! Please check it again to be an array in settings.");
  if(ignoredMembers.constructor !== Array) throw new Error("ERROR: <ignoredMembers> option is not set up right! Please check it again to be an array in settings.");
  
  // Custom 'checkMessage' event that handles messages
 client.on("checkMessage", async (message) => {
 
  //time variables
  let clock = new Date();
  let ss = String(clock.getSeconds()).padStart(2, '0');
  let min = String(clock.getMinutes()).padStart(2, '0');
  let hrs = String(clock.getHours()).padStart(1, '0');
  clock = hrs + ':' + min +':' + ss;

  let TheDate = new Date()
  let zilelesaptamanii = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let weekday = zilelesaptamanii[TheDate.getDay()];
  let dd = String(TheDate.getDate()).padStart(2, '0');
  let mon = String(TheDate.getMonth()+ 1);
  let year = String(TheDate.getFullYear()).padStart(4,'00');
  TheDate = weekday+", " + mon + '/' + dd +'/' + year;
  //end of time variables

  //verify if it's pm or AM
  let amORpm;
  if(hrs >= 0 && hrs <= 12){
      amORpm = "AM"
  }else{
      amORpm = "PM"
  };
  // The Mute function.
  const MuteMember = async (m, muteMsg) => {
    for (var i = 0; i < messageLog.length; i++) {
        if (messageLog[i].author == m.author.id) {
          messageLog.splice(i);
        }
      }
  
      punishedList.push(m.author.id);
      
      let user = m.guild.members.cache.get(m.author.id);
      let ReportChannel = m.guild.channels.cache.find(ch => ch.name === logChannel);
      if(!ReportChannel){
        try{
            ReportChannel = await m.guild.channels.create('antispam-logs', {
              type: 'text',
              permissionOverwrites:[{
                id: m.guild.id,
                deny: ['VIEW_CHANNEL']
              }]
            })
              .then(m=> m.send(`Created **\`anti-spam-Logs\`** channel since a channel for reports wasn't provided from beginning when setting up the module.`))
              .catch(console.error)
  
        }catch(e){
          console.log(e.stack);
        }
      }; // end of creating the channel for anti spam logs

      let role = m.guild.roles.cache.find(namae => namae.name === mutedRole);      
      if (!role) {
        try {
            role = await m.guild.roles.create({
              data:{
                name: "muted",
                color: "#000000",
                permissions: []
              },
              reason: `muted role wasn't found! Created a new one!`
            })
            m.guild.channels.cache.forEach(async (thechann, id) => {
                await thechann.updateOverwrite(role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SEND_TTS_MESSAGES: false,
                    ATTACH_FILES: false,
                    SPEAK: false
                });
            });
           ReportChannel.send(`Created **\`muted\`** role since a role(to be applied to muted person) wasn't provided from beginning when setting up the module.`) 
        } catch (e) {
            console.log(e.stack);
        }
    }//end of creating the role
    
      if (user) {
        user.roles.add(role).then(()=>{
          m.channel.send(`<@!${m.author.id}>, ${muteMsg}`);
          let muteEmbed = new MessageEmbed()
            .setAuthor(' Action | Auto Mute', `https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png`)
            .addField('Member muted:',`${user}`)
            .addField(`How much time got muted?:`,`${timeMuted} seconds (10 min)`)
            .addField('Reason of mute: ', `Spam`)
            .addField(`When it was muted that person:`,TheDate+ " at "+ clock+" "+amORpm)
            .setColor('#D9D900')
          ReportChannel.send(muteEmbed);
          setTimeout(()=>{
            user.roles.remove(role);
            let unmutedEmbed = new MessageEmbed()
              .setAuthor('Action | Auto Unmute')
              .addField(`Member unmuted:`,`${user}`)
              .addField(`Reason of unmute:`,`Time Expired(10 min)`)
              .setColor('#D9D900')
          ReportChannel.send(unmutedEmbed)
          }, timeMuted);
          return true;
       }).catch((e) => {
          m.guild.owner.send(`Oops, seems like i don't have sufficient permissions to mute <@!${message.author.id}>!\n It can be that or another type of error happened! Tell me on github: https://github.com/MirageZoe/ \n Everything happened on ${TheDate} at ${clock} ${amORpm} with message:\n\n\`${e.message}\`\n\n *P.S: If this is the first time getting something like this, most likely because it was not set up good the log channel at beginning and didn't know where to send the reports. Do not panic, next time it will work since he created the channel where to send the reports!*`);
          return false;
      });
    }//end of user
  }
  
    
   // The warning function.
   const WarnMember = async (m, reply) => {
    warned.push(m.author.id);
    m.channel.send(`<@${m.author.id}>, ${reply}`);
   }

    if (message.author.bot) return;
    if (message.channel.type !== "text" || !message.member || !message.guild || !message.channel.guild) return;
   
    if (message.member.roles.cache.some(r => ignoredRoles.includes(r.name)) || ignoredMembers.includes(message.author.tag)) return;

    if (message.author.id !== client.user.id) {
      let currentTime = Math.floor(Date.now());
      authors.push({
        "time": currentTime,
        "author": message.author.id
      });
      
      messageLog.push({
        "message": message.content,
        "author": message.author.id
      });
      
      let msgMatch = 0;
      for (var i = 0; i < messageLog.length; i++) {
        if (messageLog[i].message == message.content && (messageLog[i].author == message.author.id) && (message.author.id !== client.user.id)) {
          msgMatch++;
        }
      }
      
      if (msgMatch == maxDuplicatesWarning && !warned.includes(message.author.id)) {
        WarnMember(message, warningMessage);
      }

      if (msgMatch == maxDuplicatesMute && !punishedList.includes(message.author.id)) {
        MuteMember(message, muteMessage);
      }

      var matched = 0;

      for (var i = 0; i < authors.length; i++) {
        if (authors[i].time > currentTime - interval) {
          matched++;
          if (matched == limitUntilWarn && !warned.includes(message.author.id)) {
            WarnMember(message, warningMessage);
          } else if (matched == limitUntilMuted) {
            if (!punishedList.includes(message.author.id)) {
              MuteMember(message, muteMessage);
            }
          }
        } else if (authors[i].time < currentTime - interval) {
          authors.splice(i);
          warned.splice(warned.indexOf(authors[i]));
          punishedList.splice(warned.indexOf(authors[i]));
        }

        if (messageLog.length >= 200) {
          messageLog.shift();
        }
      }
    }
  });
}
