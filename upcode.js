const axios = require("axios");

const githubToken = "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"; //token github lu
const owner = "sahrilcode"; //username github lu
const repo = "fitur"; //biarin 
const branch = "main"; //biarin 

async function ensureRepoExists() {
  try {
    await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${githubToken}` },
    });
  } catch (e) {
    if (e.response?.status === 404) {
      await axios.post(
        `https://api.github.com/user/repos`,
        { name: repo, private: false },
        { headers: { Authorization: `Bearer ${githubToken}` } }
      );
    } else throw e;
  }
}

async function uploadCode(filename, content) {
  await ensureRepoExists();

  const path = `codes/${filename}`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const base64Content = Buffer.from(content, "utf-8").toString("base64");

  // Cek apakah file sudah ada
  let sha = null;
  try {
    const res = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${githubToken}` },
    });
    sha = res.data.sha;
  } catch (_) {}

  const body = {
    message: `Upload or update file ${filename}`,
    content: base64Content,
    branch,
  };
  if (sha) body.sha = sha;

  await axios.put(apiUrl, body, {
    headers: { Authorization: `Bearer ${githubToken}` },
  });

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

const handler = async (m, sock, { args, reply, example, isOwner, command, mess }) => {
  try {
    if (!isOwner) return reply(mess.owner)

    const q = m.quoted ? m.quoted : m;
    const text = q.text?.trim();
    if (!text)
      return reply(`.${command} nama file (reply kode)\n\nContoh:\n*.${command}* index.js (reply kode nya)`)

    if (!args[0])
      return reply(example(`nama file (reply kode)\n\nContoh:\n*.${command}* index.js`));

    const filename = args[0].trim();

    if (!/^[\w.\-]+$/.test(filename))
      return reply("⚠️ Nama file tidak valid (hindari spasi & simbol aneh)");

    reply("Wait proses. . .");

    const url = await uploadCode(filename, text);

    reply(`*Berhasil upload kode ke GitHub!*

- 📁 File: *${filename}*
- 🔗 URL: ${url}

> © shennime - assisten`);
  } catch (err) {
    console.error("UploadCode Error:", err);
    reply("❌ Gagal upload kode: " + err.message);
  }
};

handler.command = ["upcode"];
module.exports = handler;