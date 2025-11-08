const axios = require("axios");
const querystring = require("querystring");
const cheerio = require("cheerio");

async function savetik(url) {
  try {
    const endpoint = "https://savetik.co/api/ajaxSearch";
    const data = querystring.stringify({
      q: url,
      lang: "id",
      cftoken: "",
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "*/*",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
      Referer: "https://savetik.co/id/douyin-downloader",
    };

    const res = await axios.post(endpoint, data, { headers });
    const html = typeof res.data.data === "string" ? res.data.data : res.data?.data?.html || "";
    if (!html) throw new Error("⚠️ Gagal mengambil data dari savetik.co (respon tidak valid)");
    const $ = cheerio.load(html);

    const caption = $("h3").text().trim();
    const thumbnail = $("img").attr("src") || "";
    const video = $('a:contains("Unduh MP4")').attr("href") || "";
    const video_hd = $('a:contains("Unduh MP4 HD")').attr("href") || "";
    const audio = $('a:contains("Unduh MP3")').attr("href") || "";

    return {
      status: true,
      caption,
      thumbnail,
      video,
      video_hd,
      audio,
    };
  } catch (e) {
    return {
      status: false,
      msg: e.message,
    };
  }
}

const handler = async (m, sock, { text, command, reply, example, isOwner, isSewa, isRegis, isBan }) => {
  try {
    if (isBan) return await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    if (!isRegis) return reply(mess.regis);
    if (!text) return m.reply(`Contoh: .${command} https://www.douyin.com/video/7256984651137289483`);

    m.reply("Wait...");

    const result = await savetik(text);
    if (!result.status) return m.reply("⚠️ Gagal mengambil data dari savetik.co\n" + result.msg);

    const { caption, thumbnail, video_hd, video, audio } = result;

    if (video_hd || video) {
      await sock.sendMessage(
        m.chat,
        {
          video: { url: video_hd || video },
          caption: `*Douyin Downloader ⭐*`,
          jpegThumbnail: thumbnail
            ? await (await axios.get(thumbnail, { responseType: "arraybuffer" })).data
            : null,
        },
        { quoted: m }
      );
    } else {
      await m.reply("Video tidak ditemukan!");
    }

  } catch (err) {
    console.error("Error Douyin Downloader:", err.message);
    m.reply("Gagal mengunduh media Douyin. Mungkin link invalid atau limit situs.");
  }
};

handler.command = ["douyindl", "dy","douyin"];
module.exports = handler;