
import React, { useState, useCallback } from 'react';
import { getLanguageFeedback } from './geminiService';
import { FeedbackResponse } from './types';

const App: React.FC = () => {
  const [targetWords, setTargetWords] = useState('');
  const [userSentences, setUserSentences] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.error(err);
      setError('Niekde sa stala chyba. Skús to prosím znova.');
    } finally {
      setIsLoading(false);
    }
  }, [targetWords, userSentences]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#001f3f] mb-2">Jazyková prax</h1>
          <p className="text-gray-600 italic">Ber toto ako svoj jazykový trenažér🏃🏻 a zisti, či používas nové slová v správnom kontexte.</p>
        </header>

        <main className="space-y-6">
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯Tieto slová si chcem precvičiť:
            </label>
            <input
              type="text"
              placeholder="napr. 'mitigate', 'break a leg', 'feasibility'..."
              className="w-full p-4 rounded-lg bg-[#2d2d2d] text-white border border-transparent focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f] outline-none transition-all placeholder:text-gray-500"
              value={targetWords}
              onChange={(e) => setTargetWords(e.target.value)}
            />
          </section>

          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🚀Tu ich použi vo vetách:
            </label>
            <textarea
              rows={6}
              placeholder="Napíš jednu alebo viac viet, v ktorých použiješ vybrané slová..."
              className="w-full p-4 rounded-lg bg-[#2d2d2d] text-white border border-transparent focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f] outline-none transition-all placeholder:text-gray-500 resize-none"
              value={userSentences}
              onChange={(e) => setUserSentences(e.target.value)}
            />
          </section>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleProcess}
              disabled={isLoading}
              className={`w-full md:w-auto px-8 py-4 rounded-lg font-bold text-[#f0f0f0] bg-[#001f3f] hover:bg-[#003366] transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uvidíme!
                </>
              ) : (
                'Znie to fajn?'
              )}
            </button>

            {error && (
              <p className="text-red-600 text-sm font-medium">{error}</p>
            )}
          </div>

          {feedback && (
            <div className="mt-12 animate-fade-in space-y-8 pb-12">
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
                      {corr.isCorrect ? (
                        <span className="text-green-500">✓ Správne</span>
                      ) : (
                        <span className="text-orange-500">⚠ Vyžaduje pozornosť</span>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-tight mb-1">Tvoja veta:</p>
                      <p className="text-lg text-gray-800 font-medium">"{corr.originalSentence}"</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Spätná väzba</p>
                          <p className="text-gray-700">{corr.feedback}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Vysvetlenie</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{corr.explanation}</p>
                        </div>
                      </div>

                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        {corr.suggestion && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Návrh na vylepšenie</p>
                            <p className="text-blue-700 font-medium">{corr.suggestion}</p>
                          </div>
                        )}
                        {corr.correctExample && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Príklad použitia "{corr.wordPracticed}"</p>
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
