import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function run() {
  try {
    const res = await client.execute("SELECT value FROM app_configs WHERE key = 'WEBHOOKS'");
    let webhooks = {};
    if (res.rows.length > 0) {
      webhooks = JSON.parse(res.rows[0].value as string);
    }
    
    // Add the new webhooks
    const newWebhooks = {
      'wh_custom_loket_pasca_oplas': 'https://discordapp.com/api/webhooks/1517406507963125900/_0iPEJI_v1IAj0SBrHED413Gd17tRLepveBdVj-H2inBOc7U8h1poblRofn2aShUTMDb',
      'wh_custom_loket_ganti_foto': 'https://discordapp.com/api/webhooks/1517406758166069333/yeFJnCUDJMTR9uus9CWEX5ppcOtBolIi09kO6IiwowmnVmlnD23S-eN-twqZsLXztP-c',
      'wh_custom_loket_lisensi_senjata': 'https://discordapp.com/api/webhooks/1517407040958627850/LdLpDexerDbdfrURN1wqYaeWE_DYTQuETewcoYnBdO-9rB6glrQWG07NiPHqMIhJDkj8',
      'wh_custom_loket_lisensi_berburu': 'https://discordapp.com/api/webhooks/1517407258823098369/_7jC-KaO8ubpvHCvj9khsDyNKYcy6SuT_fsknvv7gQma0YhGNuweyGrjcWPkzfbd5mfC',
      'wh_custom_loket_ganti_nama': 'https://discordapp.com/api/webhooks/1517407365010296964/ik1o9uiBzxiavuxfeWu4fyMM7o4aeiq5ZyJdcQThZVmLYpJl4OziG44wH6hGza7oVm70',
      'wh_custom_loket_skb': 'https://discordapp.com/api/webhooks/1517407624612810812/5k1k_ZxU487DB2mDoYX_c6rXVswdO5BUQfbziE5vjZZF4gAf0qIjNKvUSq1Q-AM9J4cc',
      'wh_custom_loket_surat_keramaian': 'https://discordapp.com/api/webhooks/1517407842045268088/OkKa_RWC29JnUguophyzwGa8uvfZG1R9_bPlOxLW9ILXLjLdG5RBEDLaXPVyaDs0EPNV',
      'wh_custom_loket_surat_nikah': 'https://discordapp.com/api/webhooks/1517408229376659488/ScrYDV338Fbtm-cQkvs3O7leU5l3BGdMP3YOHMdGYg4SjbgTVyM_E2Wqo5RnNg0dE5Jx',
      'wh_custom_loket_surat_izin_usaha': 'https://discordapp.com/api/webhooks/1517408329591423126/s1OeucX1fgL8yR5Cdq4q2shiESPKJXTdHj_Lz3rVzqYXZCtcO6u0SgHcZE4f-K0Q5RO1',
      'wh_custom_loket_jasra': 'https://discordapp.com/api/webhooks/1517408472981831680/j9gpUE7cF1fXmLJ7daIBryiqpQ_nh_Cnw2RxtHkFeRJFac1OkhjehUmdDoDL5kFRhq8o',
      'wh_custom_loket_cetak_ulang_kehilangan': 'https://discordapp.com/api/webhooks/1517408634869518446/-RVjvXfMDJreGi_n7xQHVSY_S4v9JL6TdkfgONT9AROsJgWMRWaohjGAb66cJf6Dk4PC',
      'wh_custom_loket_lisensi_senjata_doc': 'https://discordapp.com/api/webhooks/1517408794366443530/BC_Fh7Rz-mrEXC7Lrfuz1UqZ02vDTvirKrs2XbvezA94LvFvHifPGN9j9OTdEAMqmOd3',
      'wh_custom_loket_surat_cerai': 'https://discordapp.com/api/webhooks/1517408968421544038/q6l7LhW03Ia6yE_FFJY6nrCt8GzG0y6N9EZw9FXcJrFpjO_lXlgGut9TQuxiQwhi81ax',
      'wh_custom_loket_surat_pengantar_cerai': 'https://discordapp.com/api/webhooks/1517409110641872916/A222mYYoYkGoxvLEeZnfRN5wgIPsgwej6M-p2HPQrA3mKr8Dby1paVn8YgFApPBzn2gH',
      'wh_custom_loket_refund_pajak': 'https://discordapp.com/api/webhooks/1517409253696995399/dlLe4PDQJr1XwRr_9Pzqo-FjdS_c7VG-h11lbZ89lKSnBpxdvoWAqQLRHvyhpLYoDHYg',
      'wh_custom_loket_pawnshop': 'https://discordapp.com/api/webhooks/1517409465161224334/q4z-nu-KMvWN_SZxwwFd7HM0rJ7y__P_as6v3S9MzoRqle3UZqLK47NNzfV4r5Y4HuqQ',
      'wh_custom_loket_slip_gaji': 'https://discordapp.com/api/webhooks/1517409580013850657/6ha8gKi21TsCbFtD06VN3HqNC_BL9wfZDlPo0QsPcGi3wHwMC-mcOhZLCQ4hBlA8mG7C',
      'wh_custom_loker_hitam': 'https://discordapp.com/api/webhooks/1517409706811855049/2pEeIH8JLPO7cqjfIYt_ojAUNpCfTv7DTxRGjDHYbqzU9vEZ2HPpnPAD4A5Y-z5vB451',
      'wh_custom_loker_umum': 'https://discordapp.com/api/webhooks/1517409891961274448/l8oTCUHVZaDPQtdGiH6fyMJraloDAILW6FPHgfqik86jm4BQyqFGGZipIvBIWC4A0Rsh',
      'wh_custom_kehadiran': 'https://discordapp.com/api/webhooks/1517409977864552458/nZ9nWtinr_geA0O9075Oxb7qS8_3lP9Ua0Cy5U_bccJa5bN__u8I0z0aZZZixlgRKmHE',
      'wh_custom_loket_surat_resign': 'https://discordapp.com/api/webhooks/1517410128687665183/TG5ZTDd5RUE7YKvCQHF9S_UoCcecYgQgdgm6TW8Rf6r_vbThEq2Pau1THsV0tpm3zXP8',
      'wh_custom_loket_surat_izin': 'https://discordapp.com/api/webhooks/1517410241946587247/5R73cMinZckoF8lFb7Gfw7p9W-I_nFI7HtoPGUAgkqhuMo4T1Rlh3y_ej6ljhi5FQ9pQ',
      'wh_custom_loket_pengaduan_rekan_kerja': 'https://discordapp.com/api/webhooks/1517410352059519026/spbq_C5XP4gFtjL9ljECyVm17DqdvFc7bLpQWmQGj40VV9ySEk1UKWEosbWwtaqh4Ir4',
      'wh_custom_loket_agenda_internal': 'https://discordapp.com/api/webhooks/1517410720847761498/Nk0NZDWSC9OqdMSYTd9NII0AtfqJrSaQCMOay2p4wgVl9Qv_aqVeflfB2D2GWTNOlPYa',
      'wh_custom_loket_agenda_external': 'https://discordapp.com/api/webhooks/1517410969792413746/XYP4zLTYN9Z1bPvv0cch75ZJVHja-ezblD4NxfkDxVn7FPSoHscwUrIyyDBrSUfVgiJ1',
      'wh_custom_loket_evaluasi_departement': 'https://discordapp.com/api/webhooks/1517411057478537277/MrEFOqGqPqB4cZt8-rZUjnxeQPU4ePwaFLRGiggWYMYAp5VcVBeXXS0_Ugbpz46Lh7BH',
      'wh_custom_loket_catatan_laporan_departement': 'https://discordapp.com/api/webhooks/1517411216103047220/gxzPzEnaFpdMJQw1dusrUVLYeEvYVYm8qx2I1pUQjz0yaD0OHwCoZjsNgSIRUpeifTpr',

      // Explicitly override map mapping for specific internal functions 
      'map_pawnshop': 'wh_custom_loket_pawnshop',
      'map_locker': 'wh_custom_loker_umum',
      'map_salary': 'wh_custom_loket_slip_gaji',
      'map_secretary': 'wh_custom_loket_agenda_internal',
    };

    const finalWebhooks = { ...webhooks, ...newWebhooks };

    if (res.rows.length > 0) {
      await client.execute({
        sql: "UPDATE app_configs SET value = ? WHERE key = 'WEBHOOKS'",
        args: [JSON.stringify(finalWebhooks)]
      });
    } else {
      await client.execute({
        sql: "INSERT INTO app_configs (key, value) VALUES ('WEBHOOKS', ?)",
        args: [JSON.stringify(finalWebhooks)]
      });
    }

    console.log("Successfully seeded new webhooks!");

  } catch(e) {
    console.error("Error migrating", e);
  }
}

run();
