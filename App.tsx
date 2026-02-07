import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { getLanguageFeedback } from './geminiService';
import { FeedbackResponse } from './types';

const App: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [targetWords, setTargetWords] = useState('');
  const [userSentences, setUserSentences] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ošetrenie hydratácie pre Vercel / SSR prostredia
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Extrakcia prvého slova pre YouGlish
  const activeWord = useMemo(() => {
    if (!targetWords.trim()) return null;
    const words = targetWords.split(',').map(w => w.trim()).filter(w => w.length > 0);
    return words.length > 0 ? words[0] : null;
  }, [targetWords]);

  const handleProcess = useCallback(async () => {
    if (!targetWords.trim() || !userSentences.trim()) {
      setError('Prosím, vyplň obe polia.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const result = await getLanguageFeedback(targetWords, userSentences);
      setFeedback(result);
    } catch (err: any) {
      console.error("Chyba pri volaní API:", err);
      
      const errorMessage = err?.message || "";
      const status = err?.status || (errorMessage.includes("420") ? 420 : errorMessage.includes("429") ? 429 : null);

      if (status === 420 || status === 429) {
        setError('Gemini práve neodpovedá, skontroluj svoje internetové pripojenie alebo skús vetu skrátiť.');
      } else {
        setError('Niekde sa stala chyba. Skús to prosím znova.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [targetWords, userSentences]);

  if (!isClient) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#001f3f] mb-2">Jazyková prax</h1>
          <p className="text-gray-600 italic">Ber toto ako svoj jazykový trenažér🏃🏻 a zisti, či používaš nové slová v správnom kontexte.</p>
        </header>

        <main className="space-y-6">
          {/* Vstupná sekcia */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎯Toto slovo si chcem precvičiť:
              </label>
              <input
                type="text"
                placeholder="napr. 'mitigate', 'break a leg'..."
                className="w-full p-4 rounded-lg bg-[#2d2d2d] text-white border border-transparent focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f] outline-none transition-all placeholder:text-gray-500"
                value={targetWords}
                onChange={(e) => setTargetWords(e.target.value)}
              />
            </div>

            {/* YouGlish Odkaz (Video kontext a výslovnosť) - Presunuté sem */}
            {activeWord && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🔊</span>
                  <div>
                    <h2 className="text-sm font-bold text-[#001f3f]">Video kontext a výslovnosť</h2>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Zisti, ako slovo <span className="text-blue-600 font-semibold">"{activeWord}"</span> vyslovujú rodení hovoriaci. 
                      Tam klikaj na tmavomodrú šípku pre ďalšie príklady.
                    </p>
                  </div>
                </div>
                
                <a 
                  href={`https://youglish.com/pronounce/${encodeURIComponent(activeWord)}/english`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-blue-700 text-sm font-semibold border border-blue-200 hover:bg-blue-50 transition-colors gap-2 whitespace-nowrap shadow-sm"
                >
                  Otvoriť YouGlish ↗
                </a>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🚀Tu ho použi vo vete:
              </label>
              <textarea
                rows={4}
                placeholder="Napíš jednu alebo viac viet..."
                className="w-full p-4 rounded-lg bg-[#2d2d2d] text-white border border-transparent focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f] outline-none transition-all placeholder:text-gray-500 resize-none"
                value={userSentences}
                onChange={(e) => setUserSentences(e.target.value)}
              />
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                onClick={handleProcess}
                disabled={isLoading}
                className={`w-full px-8 py-4 rounded-lg font-bold text-[#f0f0f0] bg-[#001f3f] hover:bg-[#003366] transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Uvidíme...' : 'Znie to fajn?'}
              </button>
              {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}
            </div>
          </section>

          {/* Feedback Sekcia */}
          {feedback && (
            <div className="mt-8 animate-fade-in space-y-8 pb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#001f3f]">
                <h2 className="text-xl font-bold text-[#001f3f] mb-2">Zhrnutie</h2>
                <p className="text-gray-700 italic">{feedback.summary}</p>
              </div>

              <div className="space-y-6">
                {feedback.corrections.map((corr, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        corr.isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {corr.wordPracticed}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-tight mb-1">Tvoja veta:</p>
                      <p className="text-lg text-gray-800 font-medium">"{corr.originalSentence}"</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-bold text-gray-400 uppercase text-[10px]">Spätná väzba</p>
                          <p className="text-gray-700">{corr.feedback}</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-400 uppercase text-[10px]">Vysvetlenie</p>
                          <p className="text-gray-600 leading-relaxed">{corr.explanation}</p>
                        </div>
                      </div>

                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg text-sm">
                        {corr.suggestion && (
                          <div>
                            <p className="font-bold text-gray-400 uppercase text-[10px]">Návrh</p>
                            <p className="text-blue-700 font-medium">{corr.suggestion}</p>
                          </div>
                        )}
                        {corr.correctExample && (
                          <div>
                            <p className="font-bold text-gray-400 uppercase text-[10px]">Príklad</p>
                            <p className="text-gray-600 italic">"{corr.correctExample}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="mt-20 text-center text-gray-400 text-xs py-8 border-t border-gray-200">
          &copy; {new Date().getFullYear()} Take Away English. Vyrobené s láskou pre študentov.
        </footer>
      </div>
    </div>
  );
};

export default App;