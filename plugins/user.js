/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const {
	System,
	parsedJid,
	isAdmin,
	updateProfilePicture,
} = require("../lib");
const {exec} = require("child_process");
const { WarnDB } = require("../lib/database");
const { WARN_COUNT } = require("../config");
const { saveWarn, resetWarn } = WarnDB;


System({
	pattern: "setpp",
	fromMe: true,
	desc: "Set profile picture",
	type: "user",
}, async (message, match, m) => {
	if (!message.reply_message.image)
	return await message.reply("_Reply to a photo_");
	let buff = await message.reply_message.download();
	await message.setPP(message.user.jid, buff);
	return await message.reply("_Profile Picture Updated_");
});

System({
	pattern: "jid",
	fromMe: true,
	desc: "Give jid of chat/user",
	type: "user",
}, async (message, match) => {
	return await message.send( message.mention.jid?.[0] || message.reply_message.jid || message.jid);
});

System({
	pattern: "pp$",
	fromMe: true,
	desc: "Set full screen profile picture",
	type: "user",
}, async (message, match) => {
	if (!message.reply_message.image)
	return await message.reply("_Reply to a photo_");
	let media = await message.reply_message.download();
	await updateProfilePicture(media, message, message.user.jid);
	return await message.reply("_Profile Picture Updated_");
});

System({
	pattern: "restart",
	fromMe: true,
	desc: "for restart bot",
	type: "user",
}, async (message, match, m) => {
    await message.send("_Restarting_");
    exec("pm2 restart jarvis", (error, stdout, stderr) => {
    if (error) { return message.send( `Error: ${error}`);
    } return; });
});

System({
	pattern: "reboot",
	fromMe: true,
	desc: "to reboot your bot",
	type: "user",
}, async (message, match, m) => {
    await message.reply('_Rebooting..._')
    require('pm2').restart('index.js');
});

System({
    pattern: "dlt",
    fromMe: true,
    desc: "deletes a message",
    type: "user",
}, async (message) => {
    await message.client.sendMessage(message.chat, { delete: message.reply_message });
});

System({
	pattern: "warn",
	fromMe: true,
	desc: "Warn a user",
	type: "group",
}, async (message, match) => {
	const userId = match || message.reply_message.sender;
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	const jid = parsedJid(userId);
	if (!userId) return message.reply("_Mention or reply to someone_");
	let reason = match;
	reason = reason.replace(/@(\d+)/, "");
	reason = reason ? reason.length <= 1 : "Reason not Provided";
	const warnInfo = await saveWarn(userId, reason);
	let userWarnCount = warnInfo ? warnInfo.warnCount : 0;
	userWarnCount++;
	await message.client.sendMessage(message.chat, {text: `_User @${jid[0].split("@")[0]} warned._ \n_Warn Count: ${userWarnCount}._ \n_Reason: ${reason}_`, mentions: jid, });
	if (userWarnCount > WARN_COUNT) {
	await message.client.sendMessage(message.jid, { text: "_Warn limit exceeded kicking user_" });
	return await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
	} else { return; }
});
  
System({
	pattern: "resetwarn",
	fromMe: true,
	desc: "Reset warnings for a user",
	type: "group",
}, async (message) => {
	const userId = match || message.reply_message.sender;
	let isadmin = await isAdmin(message, message.user.jid);
	if (!isadmin) return await message.send("_I'm not admin_");
	const jid = parsedJid(userId);
	if (!userId) return message.reply("_Mention or reply to someone_");
	await resetWarn(userId);
	return await message.client.sendMessage(message.chat, {text: `_Warnings for@${jid[0].split("@")[0]} reset_`, mentions: jid, });
});
