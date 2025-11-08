const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const handler = async (m, sock, { reply, text, isOwner, isBan, command }) => {
    try {
        if (!isOwner) return reply(mess.owner)
        const q = m.quoted ? m.quoted : m;
        const mime = q.mimetype || "";
        if (!m.quoted) return m.reply(`dengan reply audionya!`)
        if (!/audio/.test(mime)) return reply("Reply atau kirim file audio nya");
        await reply("Wait. . .");

        const media = await q.download();
        if (!Buffer.isBuffer(media)) throw new Error("Gagal mengunduh audio.");

        const tmpInput = path.join(__dirname, "temp_input.mp3");
        const tmpOutput = path.join(__dirname, "temp_output.ogg");
        fs.writeFileSync(tmpInput, media);

        await new Promise((resolve, reject) => {
            ffmpeg(tmpInput)
                .toFormat("ogg")
                .audioCodec("libopus")
                .on("end", resolve)
                .on("error", reject)
                .save(tmpOutput);
        });

        const converted = fs.readFileSync(tmpOutput);
        const caption = text ? text.trim() : "";

        await sock.sendMessage(global.idChannel, {
            audio: converted,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            caption
        }, { quoted: m });

        await reply("Berhasil mengirimkan audio 🍀");

        fs.unlinkSync(tmpInput);
        fs.unlinkSync(tmpOutput);

    } catch (err) {
        console.error(err);
        await reply("Gagal mengunggah audio ke channel.");
    }
};

handler.command = ["upmp3","upch2"];
module.exports = handler;
