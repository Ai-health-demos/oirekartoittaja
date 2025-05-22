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
}

export default function Conversation() {
  const [conversation, setConversation] = useState<QA[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversation([{ question: questions[0] }]);
  }, []);

  const handleAnswer = (answer: Answer, index: number) => {
    const updated = [...conversation];
    updated[index].selectedAnswer = answer.text;

    if (answer.followUpQuestions && answer.followUpQuestions.length) {
      // Insert first follow-up question directly after current one
      updated.push({ question: answer.followUpQuestions[0] });
    } else {
      // Find next question at the root level, if available
      const currentRootQuestionIndex = questions.findIndex(q => q.id === updated[index].question.id);
      if (questions[currentRootQuestionIndex + 1]) {
        updated.push({ question: questions[currentRootQuestionIndex + 1] });
      }
    }

    setConversation(updated);
  };

  const handleBack = () => {
    const updated = [...conversation];
    updated.pop(); // Remove current question
    if (updated.length > 0) {
      updated[updated.length - 1].selectedAnswer = undefined;
    }
    setConversation(updated);
  };

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [conversation]);

  return (
    <div className={styles.chatContainer} ref={containerRef}>
      {conversation.map((qa, index) => (
        <div key={qa.question.id} className={styles.messageGroup}>
          <div className={`${styles.chatBubble} ${styles.leftBubble}`}>
            {qa.question.question}
          </div>

          {qa.selectedAnswer && (
            <div className={`${styles.chatBubble} ${styles.rightBubble}`}>
              {qa.selectedAnswer}
            </div>
          )}

          {!qa.selectedAnswer && index === conversation.length - 1 && (
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
    </div>
  );
}
