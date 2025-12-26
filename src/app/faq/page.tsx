"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Sparkles, MessageSquare, BookOpen, Calculator, HelpCircle } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Halo! Saya asisten virtual SPK TOPSIS. Saya siap membantu menjawab pertanyaan Anda tentang Sistem Penunjang Keputusan dan metode TOPSIS. Ada yang ingin Anda ketahui?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickQuestions = [
    { icon: HelpCircle, text: "Apa itu TOPSIS?", query: "Apa itu metode TOPSIS?" },
    { icon: Calculator, text: "Cara Perhitungan", query: "Bagaimana cara perhitungan TOPSIS?" },
    { icon: BookOpen, text: "Keuntungan Sistem", query: "Apa keuntungan menggunakan sistem ini?" },
    { icon: Sparkles, text: "Tips Penggunaan", query: "Tips menggunakan sistem TOPSIS?" },
  ]

  const getResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("topsis") && (lowerMessage.includes("apa") || lowerMessage.includes("pengertian"))) {
      return "TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) adalah metode pengambilan keputusan multi-kriteria yang dikembangkan oleh Hwang dan Yoon (1981). Metode ini bekerja dengan membandingkan alternatif berdasarkan jarak terhadap solusi ideal positif (terbaik) dan solusi ideal negatif (terburuk). Semakin dekat dengan solusi ideal positif, semakin baik alternatif tersebut."
    }

    if (
      lowerMessage.includes("cara kerja") ||
      lowerMessage.includes("langkah") ||
      lowerMessage.includes("perhitungan")
    ) {
      return "TOPSIS bekerja dengan 6 langkah utama:\n\n1. **Membuat Matriks Keputusan** - Data semua alternatif dan kriteria disusun dalam bentuk matriks\n2. **Normalisasi Matriks** - Mengubah nilai ke skala yang sama menggunakan rumus normalisasi vektor\n3. **Pembobotan** - Mengalikan matriks ternormalisasi dengan bobot kriteria\n4. **Menentukan Solusi Ideal** - Mencari nilai terbaik (A+) dan terburuk (A-) untuk setiap kriteria\n5. **Menghitung Jarak** - Hitung jarak euclidean setiap alternatif ke A+ dan A-\n6. **Menghitung Skor Preferensi** - Skor = jarak ke A- / (jarak ke A+ + jarak ke A-)\n\nAlternatif dengan skor tertinggi adalah pilihan terbaik!"
    }

    if (lowerMessage.includes("keuntungan") || lowerMessage.includes("manfaat") || lowerMessage.includes("kelebihan")) {
      return "Keuntungan menggunakan sistem TOPSIS:\n\n✅ **Objektif** - Keputusan berdasarkan perhitungan matematis, bukan intuisi\n✅ **Multi-kriteria** - Dapat mempertimbangkan banyak faktor sekaligus\n✅ **Fleksibel** - Bobot kriteria dapat disesuaikan dengan prioritas\n✅ **Sistematis** - Proses terstruktur dan dapat dipertanggungjawabkan\n✅ **Cepat** - Menghemat waktu dibandingkan analisis manual\n✅ **Visual** - Hasil disajikan dalam grafik dan tabel yang mudah dipahami"
    }

    if (lowerMessage.includes("bobot") || lowerMessage.includes("weight")) {
      return "Bobot kriteria sangat penting dalam TOPSIS! Berikut tips menentukan bobot:\n\n• **Total bobot harus 100%** atau 1.0\n• Berikan bobot lebih tinggi untuk kriteria yang lebih penting bagi Anda\n• Contoh untuk mahasiswa: Harga (35%), Jarak (30%), Fasilitas (20%), Rating (15%)\n• Jika budget terbatas, prioritaskan harga\n• Jika waktu tempuh penting, tingkatkan bobot jarak\n• Anda bisa mengubah bobot kapan saja di dashboard untuk melihat perbandingan hasil"
    }

    if (lowerMessage.includes("tips") || lowerMessage.includes("panduan") || lowerMessage.includes("saran")) {
      return "Tips menggunakan sistem TOPSIS secara optimal:\n\n📊 **Data Akurat** - Gunakan data terbaru dan terverifikasi\n⚖️ **Bobot Sesuai** - Sesuaikan bobot dengan prioritas personal Anda\n🔄 **Coba Berbagai Skenario** - Ubah bobot untuk melihat sensitivitas hasil\n📝 **Catat Kriteria** - Tentukan kriteria yang relevan dengan kebutuhan\n💯 **Konsisten** - Gunakan satuan yang sama untuk setiap kriteria\n📈 **Analisis Hasil** - Jangan hanya lihat ranking, pahami juga skor dan grafiknya"
    }

    if (lowerMessage.includes("kriteria") || lowerMessage.includes("faktor")) {
      return "Kriteria yang digunakan dalam sistem pemilihan kosan:\n\n1. **Harga** - Biaya sewa per bulan (cost/benefit: cost)\n2. **Jarak** - Jarak ke kampus/kantor dalam km (cost/benefit: cost)\n3. **Fasilitas** - Skor fasilitas 1-10 (cost/benefit: benefit)\n4. **Rating** - Rating pengguna 1-5 (cost/benefit: benefit)\n5. **Sistem Keamanan** - Skor keamanan 1-10 (cost/benefit: benefit)\n\nAnda bisa menyesuaikan bobot masing-masing kriteria di dashboard!"
    }

    if (
      lowerMessage.includes("dashboard") ||
      lowerMessage.includes("cara pakai") ||
      lowerMessage.includes("cara menggunakan")
    ) {
      return "Cara menggunakan dashboard TOPSIS:\n\n1. **Buka Dashboard** - Klik menu Dashboard di navigasi\n2. **Lihat Data Kosan** - Review data kosan yang tersedia\n3. **Atur Bobot Kriteria** - Gunakan slider untuk menyesuaikan bobot sesuai prioritas\n4. **Klik Hitung TOPSIS** - Sistem akan otomatis menghitung ranking\n5. **Analisis Hasil** - Lihat grafik skor, tabel ranking, dan detail perhitungan\n6. **Tab Analisis Keamanan** - Untuk fokus pada aspek keamanan saja\n\nDashboard bersifat read-only, Anda hanya perlu atur bobot dan lihat hasil!"
    }

    if (lowerMessage.includes("skor") || lowerMessage.includes("score") || lowerMessage.includes("interpretasi")) {
      return "Cara interpretasi skor TOPSIS:\n\n🟢 **0.8 - 1.0** = Sangat Baik (Highly Recommended)\n🟢 **0.6 - 0.8** = Baik (Recommended)\n🟡 **0.4 - 0.6** = Cukup (Fair)\n🔴 **0.0 - 0.4** = Kurang Optimal (Not Recommended)\n\nSkor TOPSIS menunjukkan seberapa dekat alternatif dengan solusi ideal. Semakin tinggi skor (mendekati 1), semakin baik alternatif tersebut memenuhi semua kriteria yang Anda prioritaskan!"
    }

    if (lowerMessage.includes("spk") || lowerMessage.includes("sistem penunjang keputusan")) {
      return "SPK (Sistem Penunjang Keputusan) atau DSS (Decision Support System) adalah sistem berbasis komputer yang membantu dalam pengambilan keputusan. SPK menggunakan data, model matematis, dan antarmuka interaktif untuk memberikan rekomendasi keputusan yang lebih baik.\n\nSistem ini menggunakan metode TOPSIS sebagai core engine untuk menganalisis alternatif kosan berdasarkan multi-kriteria. Dengan SPK, Anda dapat membuat keputusan yang lebih objektif, cepat, dan terukur!"
    }

    if (lowerMessage.includes("gratis") || lowerMessage.includes("harga") || lowerMessage.includes("biaya")) {
      return "Ya, sistem ini dapat digunakan secara gratis untuk penggunaan dasar! Anda dapat:\n\n✅ Menghitung TOPSIS untuk data yang tersedia\n✅ Mengatur bobot kriteria\n✅ Melihat grafik dan tabel hasil\n✅ Menggunakan analisis keamanan\n\nSemua fitur inti tersedia tanpa biaya. Nikmati pengalaman pengambilan keputusan yang lebih baik dengan teknologi TOPSIS!"
    }

    if (
      lowerMessage.includes("terima kasih") ||
      lowerMessage.includes("thanks") ||
      lowerMessage.includes("thank you")
    ) {
      return "Sama-sama! Senang bisa membantu Anda. Jika ada pertanyaan lain tentang TOPSIS atau SPK, jangan ragu untuk bertanya. Semoga sukses dalam memilih kosan terbaik! 😊"
    }

    if (lowerMessage.includes("halo") || lowerMessage.includes("hai") || lowerMessage.includes("hello")) {
      return "Halo! Senang bertemu dengan Anda. Ada yang bisa saya bantu tentang sistem TOPSIS atau SPK? Saya siap menjawab pertanyaan Anda!"
    }

    // Default response
    return "Terima kasih atas pertanyaan Anda! Saya dapat membantu menjelaskan tentang:\n\n• Metode TOPSIS dan cara kerjanya\n• Sistem Penunjang Keputusan (SPK)\n• Cara menggunakan dashboard\n• Tips menentukan bobot kriteria\n• Interpretasi hasil dan skor\n• Kriteria pemilihan kosan\n\nSilakan ajukan pertanyaan spesifik atau pilih salah satu topik quick question di atas! 😊"
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const response = getResponse(input.trim())
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleQuickQuestion = (query: string) => {
    setInput(query)
    // Auto send after setting input
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">
            <MessageSquare className="h-3 w-3 mr-1" />
            AI Assistant
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">
            Tanya Jawab tentang <span className="text-primary">SPK & TOPSIS</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto text-pretty">
            Asisten virtual siap menjawab pertanyaan Anda seputar Sistem Penunjang Keputusan dan metode TOPSIS
          </p>
        </div>

        {/* Main Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2">
            {/* Chat Header with Gradient */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">TOPSIS Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <CardContent className="p-0">
              <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/10">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-accent to-primary"
                          : "bg-gradient-to-br from-primary to-accent"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "flex flex-col items-end" : ""}`}>
                      <div
                        className={`rounded-2xl p-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                            : "bg-card border border-border shadow-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 px-1">
                        {message.timestamp.toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="border-t bg-muted/20 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Quick Questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((q, index) => {
                    const Icon = q.icon
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-auto py-2 hover:bg-primary/5 hover:border-primary/50 bg-transparent"
                        onClick={() => handleQuickQuestion(q.query)}
                      >
                        <Icon className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{q.text}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t p-4 bg-background">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ketik pertanyaan Anda tentang TOPSIS atau SPK..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    size="icon"
                    className="bg-gradient-to-br from-primary to-accent hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Tekan Enter untuk mengirim • Shift + Enter untuk baris baru
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">AI-Powered</h3>
                <p className="text-xs text-muted-foreground">Jawaban cerdas dan kontekstual</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-6 w-6 text-accent mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Komprehensif</h3>
                <p className="text-xs text-muted-foreground">Penjelasan lengkap tentang TOPSIS</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Interaktif</h3>
                <p className="text-xs text-muted-foreground">Tanya jawab real-time 24/7</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
