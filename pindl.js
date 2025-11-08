const axios = require("axios");

async function pindonlot(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      responseType: "arraybuffer",
      decompress: true,
      maxRedirects: 3,
    });

    const html = Buffer.from(res.data, "binary").toString();

    const videoMatch = html.match(/"contentUrl":"(https:\/\/v1\.pinimg\.com\/videos\/[^\"]+\.mp4)"/);
    const gifMatch = html.match(/"contentUrl":"(https:\/\/i\.pinimg\.com\/.*?\.gif)"/);
    const imageMatch =
      html.match(/"imageSpec_736x":\{"url":"(https:\/\/i\.pinimg\.com\/736x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/) ||
      html.match(/"imageSpec_564x":\{"url":"(https:\/\/i\.pinimg\.com\/564x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/);

    const thumbMatch = html.match(/"thumbnail":"(https:\/\/i\.pinimg\.com\/videos\/thumbnails\/originals\/[^\"]+\.jpg)"/);
    const titleMatch = html.match(/"name":"([^"]+)"/);
    const authorMatch = html.match(/"fullName":"([^"]+)".+?"username":"([^"]+)"/);

    const result = {
      type: videoMatch
        ? "video"
        : gifMatch
        ? "gif"
        : "image",
      title: titleMatch ? titleMatch[1] : "Tanpa judul",
      author: authorMatch ? authorMatch[1] : "-",
      username: authorMatch ? authorMatch[2] : "-",
      media: videoMatch
        ? videoMatch[1]
        : gifMatch
        ? gifMatch[1]
        : imageMatch
        ? imageMatch[1]
        : null,
      thumbnail: thumbMatch ? thumbMatch[1] : null,
    };

    return result;
  } catch (e) {
    return { error: e.message };
  }
}

const handler = async (m, sock, { text, reply, command, isBan }) => {
  if (isBan) return reply("lu di ban gbsa")
  if (!text) return reply(`*contoh :* .pindl https://pin.it/5rLb6vZ5g`);

  reply("Wait...");

  const res = await pindonlot(text);
  if (res.error) return reply(`Gagal: ${res.error}`);
  if (!res.media) return reply("Tidak menemukan media di link tersebut.");

  const caption = `*Pinterest Downloader 📍*
  
- 📄 *Judul:* ${res.title}
- 👤 *Author:* ${res.author}
- 🔗 *Username:* ${res.username}`;
    await sock.sendMessage( m.chat, { 
    image: { url: res.media }, 
    caption 
    }, { quoted: m });
};

handler.command = ["pindl", "pinterest"];
module.exports = handler;