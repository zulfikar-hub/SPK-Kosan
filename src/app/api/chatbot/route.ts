import { streamText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return Response.json({ reply: "Pesan tidak valid" }, { status: 400 })
    }

    const systemPrompt = `Anda adalah chatbot ahli dalam Sistem Penunjang Keputusan (SPK) dan metode TOPSIS. 
    
    Tanggung jawab Anda:
    - Menjelaskan konsep SPK dan TOPSIS dengan jelas dan mudah dipahami
    - Menjawab pertanyaan tentang kriteria pemilihan kosan (Harga, Jarak, Fasilitas, Rating, Sistem Keamanan)
    - Menjelaskan cara kerja perhitungan TOPSIS
    - Memberikan informasi tentang bobot kriteria dan pengaruhnya pada ranking
    - Membantu pengguna memahami hasil analisis sistem
    
    PENTING: Hanya menjawab pertanyaan yang berkaitan dengan:
    1. Sistem Penunjang Keputusan (SPK)
    2. Metode TOPSIS
    3. Kriteria kosan dan bobotnya
    4. Cara kerja sistem ini
    5. Interpretasi hasil analisis
    
    Jika pengguna bertanya tentang hal lain yang tidak berkaitan dengan SPK atau TOPSIS, 
    berikan respons sopan bahwa Anda hanya membahas topik tersebut.
    
    Gunakan bahasa Indonesia yang jelas dan contoh-contoh praktis untuk menjelaskan konsep.`

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: message,
      temperature: 0.7,
    })

    let fullText = ""
    for await (const chunk of result.textStream) {
      fullText += chunk
    }

    return Response.json({ reply: fullText })
  } catch (error) {
    console.error("Chatbot API Error:", error)
    return Response.json({ reply: "Maaf, terjadi kesalahan pada server. Silahkan coba lagi nanti." }, { status: 500 })
  }
}
