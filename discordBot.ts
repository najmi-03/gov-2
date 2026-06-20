import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID || '';

let globalLogs: string[] = [];
let internalClient: Client | null = null;
let savedDbClient: ReturnType<typeof createClient> | null = null;

function logDebug(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(msg);
  globalLogs.unshift(line);
  if (globalLogs.length > 200) globalLogs.pop();
  try {
    fs.appendFileSync(path.join(process.cwd(), 'discord_debug.log'), line + '\n');
  } catch (e) {}
}

export function getBotLogs() {
  return globalLogs;
}

export async function forceProcessHistory() {
  if (!internalClient) throw new Error("Bot Discord belum menyala/login.");
  const channel = await internalClient.channels.fetch(TARGET_CHANNEL_ID);
  if (channel && channel.isTextBased()) {
    logDebug(`[BOT] Manual memproses riwayat channel...`);
    const messages = await (channel as TextChannel).messages.fetch({ limit: 50 });
    const msgArray = Array.from(messages.values()).reverse();
    const processor = createMessageProcessor(internalClient, savedDbClient!);
    for (const msg of msgArray) {
      await processor(msg);
    }
    logDebug(`[BOT] Manual proses riwayat selesai (${messages.size} pesan).`);
    return messages.size;
  }
  return 0;
}

function createMessageProcessor(client: Client, dbClient: ReturnType<typeof createClient>) {
  return async function processDiscordMessage(message: Message) {
    // Abaikan pesan dari bot ini sendiri agar tidak looping
    if (message.author.id === client.user?.id) return;

    if (message.channelId === TARGET_CHANNEL_ID) {
      logDebug(`[BOT] Menerima pesan/log dari: ${message.author.tag} (ID: ${message.author.id})`);
      
      let allTextLines: string[] = [];
      
      // Ambil text dari konten pesan (jika ada)
      if (message.content) {
        allTextLines.push(...message.content.replace(/[\*\_`]/g, '').split('\n'));
      }
      
      // Ambil text dari seluruh embed (Title, Author, Description, Fields)
      for (const embed of message.embeds) {
        if (embed.author?.name) allTextLines.push(embed.author.name.replace(/[\*\_`]/g, ''));
        if (embed.title) allTextLines.push(embed.title.replace(/[\*\_`]/g, ''));
        if (embed.description) allTextLines.push(...embed.description.replace(/[\*\_`]/g, '').split('\n'));
        for (const field of embed.fields) {
           allTextLines.push(field.name.replace(/[\*\_`]/g, ''));
           allTextLines.push(...field.value.replace(/[\*\_`]/g, '').split('\n'));
        }
        if (embed.footer?.text) allTextLines.push(embed.footer.text.replace(/[\*\_`]/g, ''));
      }

      // Bersihkan spasi berlebih dan baris kosong
      allTextLines = allTextLines.map(line => line.trim()).filter(line => line.length > 0);
      logDebug(`[BOT] Parsed Text Lines: ${JSON.stringify(allTextLines)}`);

      let name = "";
      let clockIn = "";
      let clockOut = "";
      let duration = "";

      for (let i = 0; i < allTextLines.length; i++) {
        const line = allTextLines[i];

        if (line.includes('Clock In:')) {
          clockIn = line.split('Clock In:')[1].trim();
          
          // Cari nama staff di baris-baris atasnya (mengabaikan teks bot/sistem)
          for (let j = i - 1; j >= 0; j--) {
            const prev = allTextLines[j].toLowerCase();
            if (!prev.includes('duty') && !prev.includes('bossmenu') && !prev.includes('app')) {
              name = allTextLines[j];
              break;
            }
          }
        } 
        if (line.includes('Clock Out:')) {
          clockOut = line.split('Clock Out:')[1].trim();
        } 
        if (line.includes('Duration:')) {
          duration = line.split('Duration:')[1].trim();
        }
      }

      // Kalau dapat nama & jam masuk, kita proses
      if (name && clockIn) {
        try {
          if (clockIn && !clockOut) {
            // Ini berarti Log Absen Masuk
            const actionIn = 'MASUK (Log)';
            
            // Cek duplikat
            const check = await dbClient.execute({
              sql: "SELECT id FROM attendance WHERE staff_name = ? AND action = ? AND timestamp = ?",
              args: [name, actionIn, clockIn]
            });

            if (check.rows.length === 0) {
              logDebug(`[BOT] Menyimpan Absen MASUK: ${name} pada ${clockIn}`);
              await dbClient.execute({
                sql: "INSERT INTO attendance (staff_name, role, action, timestamp, notes) VALUES (?, ?, ?, ?, ?)",
                args: [name, 'Log Discord', actionIn, clockIn, 'Auto-parsed IN']
              });
              logDebug(`✅ [BOT] Sukses sinkronisasi masuk.`);
            } else {
               logDebug(`[BOT] Log masuk sudah ada (Skip duplikat) untuk ${name}`);
            }
            
          } else if (clockIn && clockOut && duration) {
            const actionOut = 'PULANG (Log)';
            
            // Cek duplikat
            const check = await dbClient.execute({
              sql: "SELECT id FROM attendance WHERE staff_name = ? AND action = ? AND timestamp = ?",
              args: [name, actionOut, clockOut]
            });

            if (check.rows.length === 0) {
              logDebug(`[BOT] Menyimpan Absen PULANG: ${name} pada ${clockOut} (Durasi: ${duration})`);
              await dbClient.execute({
                sql: "INSERT INTO attendance (staff_name, role, action, timestamp, notes) VALUES (?, ?, ?, ?, ?)",
                args: [name, 'Log Discord', actionOut, clockOut, `Auto-parsed OUT. Durasi: ${duration}`]
              });
              logDebug(`✅ [BOT] Sukses sinkronisasi pulang.`);
            } else {
               logDebug(`[BOT] Log pulang sudah ada (Skip duplikat) untuk ${name}`);
            }
          }
        } catch(e) {
          logDebug(`❌ [BOT] Gagal menyimpan ke database: ${e}`);
        }
      } else {
         logDebug(`[BOT] Tidak menemukan 'Clock In' dan Nama dalam pesan ini.`);
      }
    }
  }
}

export function startDiscordBot(dbClient: ReturnType<typeof createClient>) {
  savedDbClient = dbClient;
  
  if (!TOKEN) {
    logDebug("WARN: DISCORD_BOT_TOKEN tidak ditemukan. Bot discord tidak dijalankan.");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });
  internalClient = client;
  const processDiscordMessage = createMessageProcessor(client, dbClient);

  client.once('ready', async () => {
    logDebug(`[BOT] Bot berhasil login dan aktif sebagai: ${client.user?.tag}`);
    logDebug(`[BOT] Mendengarkan channel ID: ${TARGET_CHANNEL_ID}`);
    
    try {
      const channel = await client.channels.fetch(TARGET_CHANNEL_ID);
      if (channel && channel.isTextBased()) {
        logDebug(`[BOT] Mengambil 50 pesan terakhir dari riwayat channel ${TARGET_CHANNEL_ID}...`);
        const messages = await (channel as TextChannel).messages.fetch({ limit: 50 });
        logDebug(`[BOT] Ditemukan ${messages.size} pesan riwayat. Memproses pesan...`);
        
        // Membaca pesan dr tertua sampai yg terbaru di history tsb
        const msgArray = Array.from(messages.values()).reverse();
        for (const msg of msgArray) {
          await processDiscordMessage(msg);
        }
        
        logDebug(`[BOT] Selesai memproses riwayat pesan.`);
      } else {
        logDebug(`[BOT] Peringatan: Channel ditemukan tetapi tipenya bukan TextChannel atau tidak punya text.`);
      }
    } catch(err) {
      logDebug(`[BOT] Gagal mengambil riwayat pesan. Error: ${err}`);
    }
  });

  client.on('messageCreate', async (message: Message) => {
    await processDiscordMessage(message);
  });

  client.login(TOKEN).catch((err) => {
    logDebug(`[BOT] Gagal login ke Discord: ${err}`);
  });
}
