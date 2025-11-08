const axios = require("axios");

async function vxtwitter(url) {
  if (/x.com/.test(url)) {
    url = url.replace("x.com", "twitter.com");
  }
  let { data } = await axios
    .get(url.replace("twitter.com", "api.vxtwitter.com"))
    .catch((e) => e.response);

  if (!data || !data.media_extended)
    throw new Error("⚠️ Media tidak ditemukan atau link tidak valid.");

  return {
    metadata: {
      title: data.text,
      id: data.tweetID,
      likes: data.likes?.toLocaleString() || 0,
      replies: data.replies?.toLocaleString() || 0,
      retweets: data.retweets?.toLocaleString() || 0,
      uploaded: new Date(data.date).toLocaleString(),
      author: data.user_name,
    },
    downloads: data.media_extended.map((a) => ({
      mimetype: a.type === "image" ? "image/jpg" : "video/mp4",
      url: a.url,
    })),
  };
}

const handler = async ( m, sock, { text, command, reply, example, isOwner, isSewa, isRegis, isBan }) => {
  try {
    if (isBan)
      return await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    if (!isRegis) return reply(mess.regis);
    if (!text) return reply(example("link nya mana?"));

    reply("Tunggu. . .");

    const result = await vxtwitter(text);
    const { metadata, downloads } = result;

    const caption = `*Twitter Downloader 🌟*`;

    let sent = false;
    for (const media of downloads) {
      if (media.mimetype.startsWith("video")) {
        await sock.sendMessage(
          m.chat,
          { video: { url: media.url }, caption },
          { quoted: m }
        );
        sent = true;
        break; // kirim satu video aja biar hemat bandwidth
      } else if (media.mimetype.startsWith("image")) {
        await sock.sendMessage(
          m.chat,
          { image: { url: media.url }, caption },
          { quoted: m }
        );
        sent = true;
      }
    }

    if (!sent) return reply("⚠️ Tidak ada media ditemukan di tweet ini.");

  } catch (err) {
    console.error("Error Twitter Downloader:", err.response?.data || err.message);
    reply("⚠️ Gagal mengunduh media dari Twitter. (Cek link atau mungkin private).");
  }
};

handler.command = ["twitter", "tw", "twdl"];
module.exports = handler;