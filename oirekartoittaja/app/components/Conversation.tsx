"use client"
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Conversation.module.css';
import questions from '../mock/questions.json';

interface QA {
    id: number;
    question: string;
    answers: string[];
    selectedAnswer?: string;
  }
  
  export default function Conversation() {
    const [conversation, setConversation] = useState<QA[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
  
    const handleAnswer = (answer: string) => {
      const updated = [...conversation];
      updated[currentIndex] = {
        ...updated[currentIndex],
        selectedAnswer: answer,
      };
  
      const nextIndex = currentIndex + 1;
      if (nextIndex < questions.length) {
        setConversation([...updated, questions[nextIndex]]);
        setCurrentIndex(nextIndex);
      } else {
        setConversation(updated); // no next question
      }
    };
  
    const handleBack = () => {
      if (currentIndex > 0) {
        const updated = [...conversation];
        updated.splice(currentIndex); // remove current question
        updated[currentIndex - 1].selectedAnswer = undefined;
        setConversation(updated);
        setCurrentIndex(currentIndex - 1);
      }
    };
  
    useEffect(() => {
      setConversation([questions[0]]);
    }, []);
  
    useEffect(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }, [conversation]);
  
    return (
      <div className={styles.chatContainer} ref={containerRef}>
        {conversation.map((qa, index) => (
          <div key={qa.id} className={styles.messageGroup}>
            <div className={`${styles.chatBubble} ${styles.leftBubble}`}>
              {qa.question}
            </div>
  
            {qa.selectedAnswer && (
              <div className={`${styles.chatBubble} ${styles.rightBubble}`}>
                {qa.selectedAnswer}
              </div>
            )}
  
            {!qa.selectedAnswer && index === currentIndex && (
              <div className={styles.answersContainer}>
                {qa.answers.map(answer => (
                  <button
                    key={answer}
                    onClick={() => handleAnswer(answer)}
                    className={styles.gradient_button}
                  >
                    {answer}
                  </button>
                ))}
                {currentIndex > 0 && (
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
  