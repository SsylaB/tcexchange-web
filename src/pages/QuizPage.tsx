import React, { useState } from 'react';
import '../styles/QuizPage.css';

const questions = [
  { id: 'nationalite', question: "Quelle est ta nationalité ?", options: ["UE (Union Européenne)", "Hors UE"] },
  { id: 'annee', question: "En quelle année souhaites-tu partir ?", options: ["4A", "5A"] },
  { id: 'moyenne', question: "Ta moyenne du dernier semestre ?", options: ["< 10", "10-12", "12-14", "> 15"] },
  { id: 'continent', question: "Quel continent t'attire ?", options: ["Europe", "Amérique du Nord", "Amérique Latine", "Asie", "Océanie", "Je suis ouvert à tout !"] },
  { id: 'mobilité', question: "Quel type d'accord de mobiloité envisages-tu ?", options: ["Accord de mobilité (1 semestre)", "Erasmus+", "Double Diplôme", "UNITECH"]},
  { id: 'budget', question: "Budget mensuel maximum ?", options: ["< 500€", "500-800€", "800-1200€", "> 1200€"] },
  { id: 'ville', question: "Quelle taille de ville te correspond le mieux ?", options: ["🏙️ Mégalopole", "🏙️ Grande ville", "🏡 Ville à taille humaine"] },
  { id: 'climat', question: "Ton climat idéal pour étudier ?", options: ["Chaleur et soleil", "Grand froid et neige", "Tempéré / Peu importe"] },
  { id: 'domaine', question: "Ton domaine technique ?", options: ["IA et Data Science", "Développement Web et Mobile", "Cybersécurité et Réseaux", "Management et Entreprenariat"] }
];

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [recommendations, setRecommendations] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswer = (option: string) => {
    const newAnswers = { ...answers, [questions[currentStep].id]: option };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true);
    setIsFinished(true);
    try {
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAnswers)
      });
      const data = await response.json();
      setRecommendations(data.result);
    } catch (error) {
      setRecommendations("Impossible de joindre le serveur. Vérifie que le script Python et Ollama tournent !");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="quiz-page">
      {/* Header aligné comme le catalogue */}
      <header className="quiz-page__header">
        <h1 className="quiz-page__title">✨ Quiz de destination ✨</h1>
      </header>

      {/* Boîte du quiz centrée et interactive */}
      {!isFinished ? (
        <div className="quiz-container" key={currentStep}>
          <span className="step-indicator">Question {currentStep + 1} / {questions.length}</span>
          <h2 className="quiz-question">{questions[currentStep].question}</h2>
          <div className="options-grid">
            {questions[currentStep].options.map(opt => (
              <button key={opt} onClick={() => handleAnswer(opt)} className="option-button">
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="quiz-container">
          {isLoading ? (
            <div className="loader-box">
              <div className="spinner"></div>
              <p>🤖 L'IA analyse ton profil...</p>
            </div>
          ) : (
            <div className="ai-result">
              <p style={{ whiteSpace: 'pre-wrap', textAlign: 'left', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {recommendations}
              </p>
              <button onClick={() => window.location.reload()} className="quiz-page__button">
                Refaire le quiz
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}