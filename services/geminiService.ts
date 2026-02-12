
import { GoogleGenAI } from "@google/genai";

// Always initialize with named parameter and use process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Handles citizen support queries using AI grounding against the portal knowledge base.
 */
export const getCitizenSupport = async (query: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `Anda adalah Humas AI Pemerintah San Andreas. 
        Tugas Anda HANYA menjawab pertanyaan berdasarkan data yang disediakan dalam DATA PORTAL di bawah ini.
        
        ATURAN KETAT:
        1. Jika pertanyaan pengguna TIDAK ADA di dalam DATA PORTAL, jawablah dengan: "Mohon maaf, sebagai Humas AI San Andreas, saya hanya memiliki akses informasi terkait data resmi yang tertera pada portal ini. Silakan hubungi departemen terkait untuk informasi lebih lanjut."
        2. Jangan pernah memberikan informasi di luar DATA PORTAL (seperti tips bermain GTA, informasi real-life, atau data RP lain yang tidak tertulis).
        3. Gunakan Bahasa Indonesia yang sangat formal dan profesional.
        4. Jawablah secara ringkas dan informatif.

        DATA PORTAL:
        ${context}`,
        temperature: 0.2, // Low temperature for high factual accuracy
      },
    });
    // Use the .text property directly as per latest SDK guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Layanan Humas AI sedang mengalami gangguan teknis. Mohon coba beberapa saat lagi.";
  }
};

/**
 * Generates synthetic RP city news in JSON format.
 */
export const generateCityNews = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Buatkan 3 berita singkat dan menarik untuk portal pemerintah San Andreas GTA RP. Berikan dalam format JSON array dengan properti: id, title, date, summary, tag.",
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Anda adalah jurnalis resmi pemerintah San Andreas. Buat berita yang terasa nyata dalam konteks Roleplay GTA. Gunakan tanggal hari ini.",
      },
    });
    // Safely parse the .text property
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gagal generate berita:", error);
    return null;
  }
};
