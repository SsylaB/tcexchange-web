import React, { useState } from 'react';
import '../styles/QuizPage.css';

// On définit l'interface pour TypeScript
interface Recommendation {
  nom: string;
  pays: string;
  avis: string;
  points_forts: string[];
}

const questions = [
  { id: 'nationalite', question: "Quelle est ta nationalité ?", options: ["UE (Union Européenne)", "Hors UE"] },
  { id: 'annee', question: "En quelle année souhaites-tu partir ?", options: ["4A", "5A"] },
  { id: 'moyenne', question: "Ta moyenne du dernier semestre ?", options: ["< 10", "10-12", "12-14", "> 15"] },
  { id: 'continent', question: "Quel continent t'attire ?", options: ["Europe", "Amérique du Nord", "Amérique Latine", "Asie", "Océanie", "Je suis ouvert à tout !"] },
  { id: 'mobilité', question: "Quel type d'accord de mobilité envisages-tu ?", options: ["Accord de mobilité (1 semestre)", "Erasmus+", "Double Diplôme", "UNITECH"]},
  { id: 'budget', question: "Budget mensuel maximum ?", options: ["< 500€", "500-800€", "800-1200€", "> 1200€"] },
  { id: 'ville', question: "Quelle taille de ville te correspond le mieux ?", options: ["🏙️ Mégalopole", "🏙️ Grande ville", "🏡 Ville à taille humaine"] },
  { id: 'climat', question: "Ton climat idéal pour étudier ?", options: ["Chaleur et soleil", "Grand froid et neige", "Tempéré / Peu importe"] },
  { id: 'domaine', question: "Ton domaine technique ?", options: ["IA et Data Science", "Développement Web et Mobile", "Cybersécurité et Réseaux", "Management et Entreprenariat"] }
];

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  // Modification : on attend un tableau de recommandations
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

    const answersArray = Object.values(finalAnswers);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersArray })
      });

      if (!response.ok) {
        setErrorMsg(`Erreur serveur: ${response.status}`);
        return;
      }

      const data = await response.json();
      
      // PARSING DU JSON envoyé par Rust (raw_text contient le JSON de Groq)
      try {
        const parsed = JSON.parse(data.raw_text);
        setRecommendations(parsed.recommendations);
      } catch (parseError) {
        console.error("Erreur de lecture du JSON IA:", parseError);
        setErrorMsg("L'IA a renvoyé un format illisible.");
      }
      
    } catch (error) {
      console.error("Erreur backend:", error);
      setErrorMsg("Impossible de joindre le serveur. Vérifie ton terminal Rust !");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="quiz-page">
      <header className="quiz-page__header">
        <h1 className="quiz-page__title">✨ Quiz de destination ✨</h1>
      </header>

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
        <div className={isLoading ? "quiz-container" : "results-container"}>
          {isLoading ? (
            <div className="loader-box">
              <div className="spinner"></div>
              <p>🤖 L'IA analyse ton profil...</p>
            </div>
          ) : (
            <div className="ai-results-wrapper">
              {errorMsg ? (
                <div className="error-box">{errorMsg}</div>
              ) : (
                <div className="recommendations-list">
                  {recommendations?.map((rec, index) => (
                    <div className="recommendation-item" key={index}>
                      <div className="rec-header">
                        <span className="rec-badge">#{index + 1}</span>
                        <h3>{rec.nom}, <span className="rec-country">{rec.pays}</span></h3>
                      </div>
                      <p className="rec-avis">{rec.avis}</p>
                      <div className="rec-tags">
                        {rec.points_forts.map((tag, i) => (
                          <span key={i} className="rec-tag">✨ {tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
