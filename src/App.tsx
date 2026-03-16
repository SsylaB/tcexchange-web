import React, { useState } from 'react';
import './App.css';

// Structure des questions
const questions = [
  {
    id: 'nationalite',
    question: "Quelle est ta nationalité ?",
    options: ["UE (Union Européenne)", "Hors UE"],
    note: "Important pour les frais d'inscription et les visas"
  },
  {
    id: 'annee',
    question: "En quelle année souhaites-tu partir en échange ?",
    options: ["3ème année (3A)", "4ème année (4A)", "5ème année (5A)"]
  },
  {
    id: 'moyenne',
    question: "Quelle est ta moyenne du dernier semestre ?",
    options: ["< 10", "10 - 12", "12 - 14", "> 15"]
  },
  {
    id: 'continent',
    question: "Quel continent t'attire le plus ?",
    options: ["Europe", "Amérique du Nord", "Amérique Latine", "Asie", "Océanie", "Je suis ouvert(e) à tout !"]
  },
  {
    id: 'langue',
    question: "Dans quelle(s) langue(s) as-tu un niveau B2-C1 ?",
    options: ["Anglais", "Espagnol", "Allemand", "Japonais", "Autre"]
  },
  {
    id: 'type',
    question: "Quel type de séjour envisages-tu ?",
    options: ["Accord de mobilité", "Erasmus", "Double Diplôme", "UNITECH"]
  },
  {
    id: 'budget',
    question: "Quel est ton budget mensuel maximum ?",
    options: ["< 500€", "500€ - 800€", "800€ - 1200€", "> 1200€"]
  },
  {
    id: 'ville',
    question: "Quelle taille de ville te correspond le mieux ?",
    options: ["🏙️ Mégalopole", "🏙️ Grande ville", "🏡 Ville à taille humaine"]
  },
  {
    id: 'meteo',
    question: "Ton climat idéal pour étudier ?",
    options: ["☀️ Chaleur & Soleil", "❄️ Grand froid & Neige", "☁️ Tempéré / Peu importe"]
  },
  {
    id: 'domaine',
    question: "Quel domaine technique t'attire ?",
    options: ["🤖 Intelligence Artificielle", "💻 Dev Web & Mobile", "📡 Cybersécurité", "🏢 Management"]
  },
  {
    id: 'structure',
    question: "Quel type de structure te fait rêver ?",
    options: ["🦄 Start-up", "🏢 Grands Groupes", "🔬 Recherche & Académie"]
  }
];

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (answer: string) => {
    const questionId = questions[currentStep].id;
    setAnswers({ ...answers, [questionId]: answer });

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="quiz-container result-page">
        <h2>🎉 Quiz terminé !</h2>
        <p>Merci Aida et Lilia ! Vos critères ont été enregistrés.</p>
        <p>Analyse de {questions.length} critères en cours...</p>
        <button onClick={() => window.location.reload()} className="option-button">Recommencer</button>
      </div>
    );
  }

  const progress = ((currentStep) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-card">
        <span>Question {currentStep + 1} / {questions.length}</span>
        <h2>{questions[currentStep].question}</h2>
        {questions[currentStep].note && <p style={{fontSize: '0.8em', color: '#666'}}>{questions[currentStep].note}</p>}
        
        <div className="options-grid">
          {questions[currentStep].options.map((option) => (
            <button 
              key={option} 
              className="option-button"
              onClick={() => handleAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}