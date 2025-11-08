const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const handler = async (m, sock, { reply, isRegis, example, isBan }) => {
  if (isBan)
    return await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
  if (!isRegis) return reply(mess.regis);

  const quoted = m.quoted ? m.quoted : m;
  const mime = (quoted.msg || quoted).mimetype || "";
  if (!/audio|video/.test(mime))
    return reply(example("reply ke video atau audio yang ingin dijadikan VN"));

  reply("Wait. . .");

  try {
    const mediaPath = await sock.downloadAndSaveMediaMessage(quoted);
    const outPath = path.join(__dirname, `temp_${Date.now()}.ogg`);

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i "${mediaPath}" -vn -c:a libopus -b:a 128k -ar 48000 "${outPath}"`,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    await sock.sendMessage(
      m.chat,
      {
        audio: { url: outPath },
        mimetype: "audio/ogg; codecs=opus",
        ptt: true, 
      },
      { quoted: m }
    );

    fs.unlinkSync(mediaPath);
    fs.unlinkSync(outPath);
  } catch (err) {
    console.error(err);
    reply("❌ Gagal mengonversi ke VN. Coba lagi nanti.");
  }
};

handler.command = ["toptt", "tovn", "tovoicenote"];
module.exports = handler;