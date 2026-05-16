import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('[Gemini] EXPO_PUBLIC_GEMINI_API_KEY tanımlı değil');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function testGeminiConnection(): Promise<{
  ok: boolean;
  response?: string;
  error?: string;
}> {
  if (!genAI) {
    return { ok: false, error: 'API key tanımlı değil (.env dosyasını kontrol et)' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(
      'Türkçe olarak tek cümleyle "Merhaba, bağlantı çalışıyor" de.'
    );
    const text = result.response.text();
    return { ok: true, response: text };
  } catch (error: any) {
    return { ok: false, error: error.message ?? 'Bilinmeyen hata' };
  }
}

// ---- Adaptif Karar Sistemi ----

export type AdaptiveAction = 'gorev_kucult' | 'mod_degistir' | 'mola_oner';

export type AdaptiveContext = {
  childAge: number;
  sessionDurationSeconds: number;
  focusScore: number;
  errorRate: number;
  pauseFrequency: number;
  currentDifficulty: 'easy' | 'medium' | 'hard';
};

export type AdaptiveDecision = {
  action: AdaptiveAction;
  reason: string;
};

const ADAPTIVE_SYSTEM_PROMPT = `Sen bir çocuk gelişimi asistanısın. DEHB konusunda uzmansın.
Klinik terim kullanma. Sıcak ve anlayışlı bir ton kullan.
Sadece geçerli JSON formatında yanıt ver. Türkçe yaz.
Yanıtın SADECE şu formatta olmalı, başka hiçbir metin ekleme:
{"action": "gorev_kucult" | "mod_degistir" | "mola_oner", "reason": "kısa Türkçe gerekçe"}`;

export async function getAdaptiveDecision(
  context: AdaptiveContext
): Promise<{ ok: boolean; decision?: AdaptiveDecision; error?: string }> {
  if (!genAI) {
    return { ok: false, error: 'Gemini API key tanımlı değil' };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: ADAPTIVE_SYSTEM_PROMPT,
    });

    const userPrompt = `Bu çocuk oyunu bırakmak üzere görünüyor.

Bağlam:
- Yaş: ${context.childAge}
- Oturum süresi: ${context.sessionDurationSeconds} saniye
- Odak skoru: ${context.focusScore}/100
- Hata oranı: ${(context.errorRate * 100).toFixed(0)}%
- Duraklama sayısı: ${context.pauseFrequency}
- Mevcut zorluk: ${context.currentDifficulty}

Şu 3 seçenekten birini seç:
- "gorev_kucult": Görevi kolaylaştır (daha az seçenek, daha büyük harf)
- "mod_degistir": Başka tür oyuna geç (henüz uygulanmadı, son çare)
- "mola_oner": Çocuğa kısa mola öner

JSON döndür.`;

    const result = await model.generateContent(userPrompt);
    const text = result.response.text().trim();

    // JSON parse — markdown fence'leri temizle
    const BT = String.fromCharCode(96);
    const fenceStart = new RegExp('^' + BT + BT + BT + 'json\\s*', 'i');
    const fenceEnd = new RegExp(BT + BT + BT + '$');
    const cleaned = text.replace(fenceStart, '').replace(fenceEnd, '').trim();
    const parsed = JSON.parse(cleaned) as AdaptiveDecision;

    // Doğrulama
    const validActions: AdaptiveAction[] = ['gorev_kucult', 'mod_degistir', 'mola_oner'];
    if (!validActions.includes(parsed.action)) {
      return { ok: false, error: 'Geçersiz action: ' + parsed.action };
    }

    return { ok: true, decision: parsed };
  } catch (error: any) {
    return { ok: false, error: error.message ?? 'Bilinmeyen hata' };
  }
}
