
export const sendToDiscord = async (webhookUrl: string, content: any) => {
  if (!webhookUrl) {
    console.warn("Discord Webhook URL tidak dikonfigurasi.");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    return response.ok;
  } catch (error) {
    console.error("Gagal mengirim ke Discord:", error);
    return false;
  }
};

export const sendFileToDiscord = async (webhookUrl: string, formData: FormData) => {
  if (!webhookUrl) {
    console.warn("Discord Webhook URL tidak dikonfigurasi.");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData, // Browser otomatis mengatur Content-Type: multipart/form-data
    });
    return response.ok;
  } catch (error) {
    console.error("Gagal mengirim file ke Discord:", error);
    return false;
  }
};

export const formatSalarySlipEmbed = (salary: any) => {
  const penaltyMap: any = { 'NONE': '0%', 'SP1': '50%', 'SP2': '75%', 'SP3': '100%' };
  const statusIcons: any = { 'NONE': '✅', 'SP1': '⚠️', 'SP2': '🟠', 'SP3': '🚫' };
  
  let penaltyMultiplier = 1;
  if (salary.penaltyLevel === 'SP1') penaltyMultiplier = 0.5;
  if (salary.penaltyLevel === 'SP2') penaltyMultiplier = 0.25;
  if (salary.penaltyLevel === 'SP3') penaltyMultiplier = 0;

  const penaltyAmount = salary.baseSalary * (1 - penaltyMultiplier);
  const netSalary = (salary.baseSalary * penaltyMultiplier) + salary.bonus;

  return {
    embeds: [{
      title: "📜 SLIP GAJI RESMI PEMERINTAH SAN ANDREAS",
      description: `Nomor Ref: **GOV/SAL/${Date.now().toString().slice(-6)}**\nDokumen ini adalah bukti pembayaran sah dari Kas Negara.`,
      color: 16753920, // Amber/Gold
      fields: [
        { name: "👤 NAMA PENERIMA", value: `**${salary.staffName}**`, inline: true },
        { name: "💼 JABATAN", value: `${salary.position}`, inline: true },
        { name: "🏛️ DEPARTEMEN", value: `${salary.deptName}`, inline: true },
        { name: "──────────────", value: "**RINCIAN KEUANGAN**", inline: false },
        { name: "💵 Gaji Pokok", value: `$${salary.baseSalary.toLocaleString()}`, inline: true },
        { name: "✨ Bonus/Lembur", value: `+$${salary.bonus.toLocaleString()}`, inline: true },
        { name: `${statusIcons[salary.penaltyLevel]} Penalti (${salary.penaltyLevel})`, value: `-$${penaltyAmount.toLocaleString()} (${penaltyMap[salary.penaltyLevel]})`, inline: true },
        { name: "──────────────", value: `### 💰 TOTAL BERSIH: **$${netSalary.toLocaleString()}**`, inline: false }
      ],
      footer: { 
        text: "Bendahara Negara: Victoria Glass | Kantor Kepresidenan San Andreas",
        icon_url: "https://blogger.googleusercontent.com/img/a/AVvXsEigfFHDwET6WcoyZsPDctYIYqzOPBzgSWiI_nS_IiBc-PsfxQCuG8eTgCHBORigLnRLS88CORpe2uCRmpArgah-C-emOR0yMvEFy9FYPDVyqBsDqV5S5N3qFhm_fwaKjcinQNZbcQ7ksAfw9gX8cwTICsGMvGvXbQZ76qhacRGtRJ46XoaTazeHXAjI0J_Lw"
      },
      timestamp: new Date().toISOString()
    }]
  };
};

// Helper untuk format sisa waktu di Discord
const getExpiryLabel = (expiryDate?: number) => {
  if (!expiryDate) return "";
  const diff = expiryDate - Date.now();
  if (diff <= 0) return " (EXPIRED)";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return ` (⏳ ${days} Hari)`;
  return ` (⚠️ ${hours} Jam)`;
};

export const formatInventoryEmbed = (
  type: 'UMUM' | 'HITAM' | 'PAWNSHOP', 
  items: any[], 
  staffName?: string | null, 
  staffRole?: string,
  logs: string[] = [] 
) => {
  let title = "📦 LAPORAN LOKER UMUM";
  let color = 3447003; 
  let description = "Pembaruan ketersediaan logistik publik San Andreas.";

  if (type === 'HITAM') {
    title = "⚠️ LAPORAN LOKER HITAM (SITAAN)";
    color = 15548997; 
    description = "Pembaruan inventaris barang sitaan pihak berwenang.";
  } else if (type === 'PAWNSHOP') {
    title = "⚖️ INDIKATOR HARGA PAWNSHOP";
    color = 16753920; 
    description = "Informasi harga jual warga ke negara saat ini berdasarkan kondisi gudang logistik:\n\n" +
                  "🔵 = **200%**\n" +
                  "🟢 = **150%**\n" +
                  "🟡 = **100%**\n" +
                  "🔴 = **50%**\n" +
                  "❌ = **STOP**";
    
    const grouped: any = {};
    items.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      const statusIcons: any = { BLUE: '🔵', GREEN: '🟢', YELLOW: '🟡', RED: '🔴', BLACK: '❌' };
      const statusMulti: any = { BLUE: 2.0, GREEN: 1.5, YELLOW: 1.0, RED: 0.5, BLACK: 0 };
      const currentPrice = (item.basePrice * statusMulti[item.status as keyof typeof statusMulti]).toFixed(0);
      const priceLabel = item.status === 'BLACK' ? '~~CLOSED~~' : `$${currentPrice}`;
      grouped[item.category].push(`${statusIcons[item.status as keyof typeof statusIcons]} **${item.name}**: ${priceLabel}`);
    });

    return {
      embeds: [{
        title,
        description,
        color,
        fields: Object.keys(grouped).map(cat => ({
          name: `__${cat}__`,
          value: grouped[cat].join('\n'),
          inline: true
        })),
        footer: { text: "Kementerian Ekonomi & Logistik San Andreas" },
        timestamp: new Date().toISOString()
      }]
    };
  }

  // LOGIC KHUSUS UMUM & HITAM
  const headerFields = staffName ? [
    { name: "👤 Petugas Pelapor", value: staffName, inline: true },
    { name: "🎖️ Jabatan", value: staffRole || "Staff", inline: true },
    { name: "🕒 Waktu Laporan", value: new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' }), inline: true },
  ] : [];

  const itemFields = items.length > 0 ? items.map(item => ({
    name: `🔹 ${item.name}${getExpiryLabel(item.expiryDate)}`,
    value: `Jumlah: **${item.stock.toLocaleString()} unit**`,
    inline: true
  })) : [{ name: "Status", value: "Gudang Kosong", inline: false }];

  // Menambahkan Field Log Aktivitas jika ada data log
  const logFields = [];
  if (logs && logs.length > 0) {
    const logString = logs.join('\n');
    const displayLog = logString.length > 1000 ? logString.substring(0, 1000) + '... (dan lainnya)' : logString;
    
    logFields.push({
      name: "📋 RIWAYAT AKTIVITAS (Sesi Ini)",
      value: "```diff\n" + displayLog + "\n```",
      inline: false
    });
  }

  const divider = [{ name: "────────────────", value: "**DAFTAR INVENTARIS TERKINI**", inline: false }];

  return {
    embeds: [{
      title,
      description,
      color,
      fields: [...headerFields, ...logFields, ...divider, ...itemFields],
      footer: { text: "Sistem Manajemen Logistik San Andreas" },
      timestamp: new Date().toISOString()
    }]
  };
};
