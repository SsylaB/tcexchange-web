import React, { useState } from 'react';
import './App.css';

const questions = [
  { id: 'nationalite', question: "Quelle est ta nationalité ?", options: ["UE (Union Européenne)", "Hors UE"] },
  { id: 'annee', question: "En quelle année souhaites-tu partir ?", options: ["3A", "4A", "5A"] },
  { id: 'moyenne', question: "Ta moyenne du dernier semestre ?", options: ["< 10", "10-12", "12-14", "> 15"] },
  { id: 'continent', question: "Quel continent t'attire ?", options: ["Europe", "Amérique", "Asie", "Océanie"] },
  { id: 'budget', question: "Budget mensuel maximum ?", options: ["< 500€", "500-800€", "800-1200€", "> 1200€"] },
  { id: 'domaine', question: "Ton domaine technique ?", options: ["IA", "Dev Web", "Cyber", "Management"] }
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

  if (isFinished) {
    return (
      <div className="quiz-container">
        <h2>✨ Tes résultats</h2>
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
            <button onClick={() => window.location.reload()} className="option-button" style={{marginTop: '20px', width: '100%'}}>
              Refaire le quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    // La "key" permet de relancer l'animation CSS à chaque question
    <div className="quiz-container" key={currentStep}>
      <span className="step-indicator">Question {currentStep + 1} / {questions.length}</span>
      <h2>{questions[currentStep].question}</h2>
      <div className="options-grid">
        {questions[currentStep].options.map(opt => (
          <button key={opt} onClick={() => handleAnswer(opt)} className="option-button">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}