const handler = async (m, sock, { reply, isOwner, text }) => {
    if (!isOwner) return reply(mess.owner)
    if (!text) return reply(`Contoh:\n.pol judul,opsi 1,opsi 2, opsi 3, dst`)
    const args = text.split(',').map(v => v.trim());
    const title = args.shift();

    if (!title || args.length < 2) 
        return reply(`Masukkan minimal 2 opsi!\nContoh:\n.pol Pilih warna?,Merah,Biru,Hijau`);

    try {
        await sock.sendMessage(m.chat, {
            poll: {
                name: title,
                values: args,
                selectableCount: 1,
                // ini penting biar bisa juga di private chat
                toAnnouncementGroup: false 
            }
        });
    } catch (e) {
        console.error(e);
        reply('❌ Gagal mengirim polling! Pastikan versi Baileys-mu support fitur poll.');
    }
}

handler.command = ["pol2", "poll"];
export default handler;