/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const {
    System,
    isPrivate,
    extractUrlFromMessage,
    isUrl,
    sleep,
    isAdmin,
    parsedJid,
    isBotAdmins,
    updateProfilePicture,
} = require("../lib/");

System({
	pattern: "add$",
	fromMe: isPrivate,
	desc: "Adds a person to group",
	type: "group",
	}, async (message, match) => {
	if (!message.isGroup)
	return await message.reply("_This command is for groups_");
	match = message.mention.jid?.[0] || message.reply_message.sender || match
	if (!match) return await message.send("_Mention user to add");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	let jid = parsedJid(match);
	await message.client.groupParticipantsUpdate(message.chat, jid, "add");
	return await message.client.sendMessage(message.chat, {text: `_@${jid[0].split("@")[0]} added successfully_`, mentions: jid, });
	});

System({
	pattern: "kick$",
	fromMe: isPrivate,
	desc: "kicks a person from group",
	type: "group",
	}, async (message, match) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	match = message.mention.jid?.[0] || message.reply_message.sender || match
	if (!match) return await message.send("_Mention user to kick");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	const jid = parsedJid(match)
	await await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
	return await message.client.sendMessage(message.chat, {text: `_@${jid[0].split("@")[0]} kicked successfully_`, mentions: jid, });
	});

System({
	pattern: "promote$",
	fromMe: isPrivate,
	desc: "promote a member",
	type: "group",
	}, async (message, match) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	match = message.mention.jid?.[0] || message.reply_message.sender || match
	if (!match) return await message.send("_Mention user to promote_");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	let jid = parsedJid(match);
	await await message.client.groupParticipantsUpdate(message.jid, jid, "promote");
	return await message.client.sendMessage(message.chat, {text: `_@${jid[0].split("@")[0]} promoted as admin successfully_`, mentions: jid, });
	});


System({
	pattern: "demote$",
	fromMe: isPrivate,
	desc: "demote a member",
	type: "group",
	}, async (message, match) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	match = message.mention.jid?.[0] || message.reply_message.sender || match
	if (!match) return await message.send("_Mention user to demote");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	let jid = parsedJid(match);
	await await message.client.groupParticipantsUpdate(message.jid, jid, "demote");
	return await message.client.sendMessage(message.chat, {text: `_@${jid[0].split("@")[0]} demoted from admin successfully_`, mentions: jid, });
	});


System({
    pattern: 'invite ?(.*)',
    fromMe: true,
    desc: "Provides the group's invitation link.",
    type: 'group'
    }, async (message) => {
    if (!message.isGroup)
    return await message.reply("_This command is for groups_");
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) return await message.send("_I'm not admin_");
    const data = await message.client.groupInviteCode(message.data.bot);
    return await message.reply(`https://chat.whatsapp.com/${data}`);
});


System({
	pattern: "mute",
	fromMe: true,
	desc: "nute group",
	type: "group",
	}, async (message) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	const mute = await message.send("_Muting Group_");
	await sleep(500);
	await message.client.groupSettingUpdate(message.jid, "announcement");
	return await mute.edit("_Group Muted successfully_");
	});

System({
	pattern: "unmute",
	fromMe: true,
	desc: "unmute group",
	type: "group",
	}, async (message) => {
	if (!message.isGroup)
	return await message.send("_This command is for groups_");
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	const mute = await message.send("_Unmuting Group_");
	await sleep(500);
	await message.client.groupSettingUpdate(message.jid, "not_announcement");
	return await mute.edit("_Group Unmuted successfully_");
	});

System({
	pattern: "kickall",
	fromMe: isPrivate,
	desc: "Adds a person to group",
	type: "group",
	}, async (message) => {
	let { participants } = await message.client.groupMetadata(message.jid);
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
        for (let key of participants) {
	let jid = parsedJid(key.id);
	await await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
	return await message.client.sendMessage(message.chat, {text: `_@${jid[0].split("@")[0]} kicked successfully_`, mentions: jid, });
	}});


System({
	pattern: "tagall",
	fromMe: true,
	desc: "mention all users in the group",
	type: "group",
	}, async (message) => {
	if (!message.isGroup) return;
	const { participants } = await message.client.groupMetadata(message.jid);
	if (!Array.isArray(participants)) { console.error("participants is not an array or is undefined."); return; }
	let teks = "";
	for (let i = 0; i < participants.length; i++) {
	const mem = participants[i];
	if (mem.id) { teks += (i + 1) + " @" + mem.id.split("@")[0] + "\n";}}
	return await message.send(teks.trim(), { mentions: participants.map((a) => a.id),});
	});


System({
	pattern: "gpp$",
	fromMe: true,
	desc: "Set full-screen profile picture",
	type: "user",
	}, async (message) => {
    if (!message.isGroup) { return await message.send("_This command is for groups_"); }
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) { return await message.send("_I'm not an admin_"); }
    if (!message.reply_message.image) { return await message.send("_Reply to a photo_"); }
    try { const media = await message.reply_message.download();
    await updateProfilePicture(media, message, message.jid);
    return await message.send("_Group Profile Picture Updated_"); } catch (error) {
    console.error("Error updating profile picture:", error);
    return await message.send("_Failed to update profile picture_");
    }});

System({
    pattern: 'revoke ?(.*)',
    fromMe: true,
    desc: "Revoke Group invite link.",
    type: 'group'
    }, async (message) => {
    if (!message.isGroup)
    return await message.reply("_This command is for groups_");
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) return await message.send("_I'm not admin_");
    await message.client.groupRevokeInvite(message.data.bot)
    await message.send('_Revoked_');
    });

System({
    pattern: 'join ?(.*)',
    fromMe: true,
    desc: "to join a group",
    type: 'group'
    }, async (message, match) => {
   match = match || message.reply_message.text;
   const matchUrl = extractUrlFromMessage(match);
   if (isUrl(matchUrl) && matchUrl.includes('chat.whatsapp.com')) {
   const groupCode = matchUrl.split('https://chat.whatsapp.com/')[1];
   const joinResult = await message.data.client.groupAcceptInvite(groupCode);
   if (!joinResult) { return await message.reply('_Invalid Group Link!_'); } else {
   return await message.reply('_Joined!_'); } } else {
   await message.send('_Enter a valid group link!_');
   }});

System({
	pattern: 'left ?(.*)',
	fromMe: true,
	desc: 'Left from group',
	type: 'group'
}, async (message) => {
    if (!message.isGroup)
    return await message.reply("_This command is for groups_");
    await message.client.groupLeave(message.data.bot)
});

System({
    pattern: 'lock ?(.*)',
    fromMe: true,
    desc: "only allow admins to modify the group's settings",
    type: 'group'
    }, async (message, match) => {
    if (!message.isGroup)
    return await message.reply("_This command is for groups_");
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) return await message.send("_I'm not admin_");
    const meta = await message.client.groupMetadata(message.chat)
    if (meta.restrict) return await message.send("_Already only admin can modify group settings_")
    await client.groupSettingUpdate(message.data.bot, 'locked')
    return await message.send("*Only admin can modify group settings*")
    });

System({
    pattern: 'unlock ?(.*)',
    fromMe: true,
    desc: "allow everyone to modify the group's settings -- like display picture etc.",
    type: 'group'
    }, async (message, match) => {
    if (!message.isGroup)
    return await message.reply("_This command is for groups_");
    let isadmin = await isAdmin(message, message.user.jid);
    if (!isadmin) return await message.send("_I'm not admin_");
    const meta = await message.client.groupMetadata(message.data.bot)
    if (!meta.restrict) return await message.send("_Already everyone can modify group settings_")
    await message.client.groupSettingUpdate(message.data.bot, 'unlocked')
    return await message.send("*Everyone can modify group settings*")
    });

System({
	pattern: 'gname ?(.*)',
	fromMe: true,
	desc: "To change the group's subject",
	type: 'group'
}, async (message, match, client) => {
	match = match || message.reply_message.text
	if (!message.isGroup)
	return await message.reply("_This command is for groups_");
	if (!match) return await message.send('*Need Subject!*\n*Example: gname New Subject!*.')
	const meta = await message.client.groupMetadata(message.chat)
	if (!meta.restrict) {
	await message.client.groupUpdateSubject(message.chat, match)
	return await message.send("*Subject updated*") }
	const isbotAdmin = await isBotAdmins(message)
	if (!isbotAdmin) return await message.send("I'm not an admin")
	await client.groupUpdateSubject(message.chat, match)
	return await message.send("*Subject updated*")
})


System({
	pattern: 'gdesc ?(.*)',
	fromMe: true,
	desc: "To change the group's description",
	type: 'group'
}, async (message, match, client) => {
	match = match || message.reply_message.text
	if (!message.isGroup)
	return await message.reply("_This command is for groups_");
	if (!match) return await message.send('*Need Description!*\n*Example: gdesc New Description!*.')
	const meta = await message.client.groupMetadata(message.data.bot)
	if (!meta.restrict) {
	await message.client.groupUpdateDescription(message.data.bot, match)
	return await message.send("_*Description updated*_")
	} const isbotAdmin = await isBotAdmins(message.data)
	if (!isbotAdmin) return await message.send("_I'm not an admin_")
	await message.client.groupUpdateDescription(message.data.bot, match)
	return await message.send("_*Description updated*_")
})
