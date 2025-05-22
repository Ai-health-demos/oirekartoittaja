"use client"
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Conversation.module.css';
import questions from '../mock/questions2.json';

interface Answer {
  text: string;
  followUpQuestions?: Question[];
}

interface Question {
  id: string;
  question: string;
  answers: Answer[];
}

interface QA {
  question: Question;
  selectedAnswer?: string;
  path: string; // Unique path identifier
}

export default function Conversation() {
  const [conversation, setConversation] = useState<QA[]>([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversation([{ question: questions[0], path: questions[0].id }]);
  }, []);

  const handleAnswer = (answer: Answer, index: number) => {
    const updated = conversation.slice(0, index + 1);
    updated[index].selectedAnswer = answer.text;

    if (answer.followUpQuestions && answer.followUpQuestions.length) {
      // Push first follow-up question with a unique path
      const nextQuestion = answer.followUpQuestions[0];
      const nextPath = `${updated[index].path}.${nextQuestion.id}`;
      updated.push({ question: nextQuestion, path: nextPath });
    } else {
      // Check if more root-level questions are available
      const rootQuestionIds = conversation.map((q) => q.question.id);
      const currentRootIndex = questions.findIndex(q => q.id === conversation[0].question.id);
      const nextRootQuestion = questions[currentRootIndex + updated.filter(q => !q.path.includes('.')).length];

      if (nextRootQuestion) {
        updated.push({ question: nextRootQuestion, path: nextRootQuestion.id });
      }
    }

    setConversation(updated);
    setShowSummary(false);
  };

  const handleBack = () => {
    const updated = [...conversation];
    updated.pop();
    if (updated.length > 0) {
      updated[updated.length - 1].selectedAnswer = undefined;
    }
    setConversation(updated);
    setShowSummary(false);
  };

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [conversation, showSummary]);

  return (
    <div className={styles.chatContainer} ref={containerRef}>
      {conversation.map((qa, index) => (
        <div key={qa.path} className={styles.messageGroup}>
          <div className={`${styles.chatBubble} ${styles.leftBubble}`}>
            {qa.question.question}
          </div>

          {qa.selectedAnswer && (
            <div className={`${styles.chatBubble} ${styles.rightBubble}`}>
              {qa.selectedAnswer}
            </div>
          )}

          {!qa.selectedAnswer && index === conversation.length - 1 && !showSummary && (
            <div className={styles.answersContainer}>
              {qa.question.answers.map(answer => (
                <button
                  key={answer.text}
                  onClick={() => handleAnswer(answer, index)}
                  className={styles.gradient_button}
                >
                  {answer.text}
                </button>
              ))}
              {index > 0 && (
                <button className={styles.backButton} onClick={handleBack}>
                  ← Back
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {conversation.length > 0 &&
        conversation.every((qa) => qa.selectedAnswer) &&
        !showSummary && (
          <div className={styles.finalInfoContainer}>
            <h2 className={styles.infoTitle}>Lisättävää?</h2>
            <textarea
              placeholder="Kirjoita lisätietoja tähän..."
              className={styles.extraInfoTextbox}
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
            />
            <button
              className={styles.summaryButton}
              onClick={() => setShowSummary(true)}
            >
              Näytä yhteenveto
            </button>
          </div>
        )}

      {showSummary && (
        <div className={styles.summaryContainer}>
        <h2 className={styles.summaryTitle}>Yhteenveto</h2>
        <div className={styles.qaList}>
          {conversation.map((qa) => (
            <div key={qa.path} className={styles.qaItem}>
              <h4 className={styles.qaQuestion}>{qa.question.question}</h4>
              <div className={styles.qaAnswer}>{qa.selectedAnswer}</div>
            </div>
          ))}
        </div>
      
        {extraInfo && (
          <>
            <h3 className={styles.extraInfoTitle}>Lisätietoja:</h3>
            <p className={styles.extraInfoContent}>{extraInfo}</p>
          </>
        )}
      </div>
      )}
    </div>
  );
}
