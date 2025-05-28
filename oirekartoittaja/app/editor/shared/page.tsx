'use client';

import { defaultSharedQuestions, getSharedQuestions, saveSharedQuestions, SharedQuestion } from '@/app/lib/sharedQuestions';
import styles from '@/app/styles/QuestionEditor.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const SharedQuestionsManager = () => {
  const [sharedQuestions, setSharedQuestions] = useState<SharedQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setSharedQuestions(getSharedQuestions());
  }, []);

  const updateQuestion = (id: string, newQuestion: string) => {
    const updated = sharedQuestions.map(sq => 
      sq.id === id ? { ...sq, question: newQuestion } : sq
    );
    setSharedQuestions(updated);
    saveSharedQuestions(updated);
  };

  const updateAnswer = (id: string, answerIdx: number, newText: string) => {
    const updated = sharedQuestions.map(sq => 
      sq.id === id 
        ? {
            ...sq, 
            answers: sq.answers.map((a, idx) => 
              idx === answerIdx ? { text: newText } : a
            )
          }
        : sq
    );
    setSharedQuestions(updated);
    saveSharedQuestions(updated);
  };

  const addAnswer = (id: string) => {
    const updated = sharedQuestions.map(sq => 
      sq.id === id 
        ? { ...sq, answers: [...sq.answers, { text: 'Uusi vastaus' }] }
        : sq
    );
    setSharedQuestions(updated);
    saveSharedQuestions(updated);
  };

  const removeAnswer = (id: string, answerIdx: number) => {
    const updated = sharedQuestions.map(sq => 
      sq.id === id && sq.answers.length > 1
        ? { ...sq, answers: sq.answers.filter((_, idx) => idx !== answerIdx) }
        : sq
    );
    setSharedQuestions(updated);
    saveSharedQuestions(updated);
  };

  const deleteSharedQuestion = (id: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän jaetun kysymyksen? Se poistetaan myös kaikista kyselyistä joissa sitä käytetään.')) {
      return;
    }
    
    const updated = sharedQuestions.filter(sq => sq.id !== id);
    setSharedQuestions(updated);
    saveSharedQuestions(updated);
  };

  const addNewSharedQuestion = () => {
    const newQuestion: SharedQuestion = {
      id: `shared_${Date.now()}`,
      question: 'Uusi jaettu kysymys',
      answers: [{ text: 'Vastaus 1' }, { text: 'Vastaus 2' }],
      isShared: true
    };
    
    const updated = [...sharedQuestions, newQuestion];
    setSharedQuestions(updated);
    saveSharedQuestions(updated);
    setEditingId(newQuestion.id);
  };

  const resetToDefaults = () => {
    if (!confirm('Haluatko palauttaa oletuskysymykset? Tämä poistaa kaikki mukautetut jaetut kysymykset.')) {
      return;
    }
    setSharedQuestions(defaultSharedQuestions);
    saveSharedQuestions(defaultSharedQuestions);
  };

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <Link href="/editor">← Takaisin editoriin</Link>
      </nav>
      
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h2>Jaettujen kysymysten hallinta</h2>
          <p className={styles.subtitle}>
            Näitä kysymyksiä voi käyttää useissa kyselyissä. Kun muokkaat kysymystä täällä, 
            muutokset näkyvät kaikissa kyselyissä joissa kysymystä käytetään.
          </p>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.addBtn} onClick={addNewSharedQuestion}>
            + Lisää uusi jaettu kysymys
          </button>
          <button className={styles.resetBtn} onClick={resetToDefaults}>
            🔄 Palauta oletuskysymykset
          </button>
        </div>

        <div className={styles.questionsContainer}>
          {sharedQuestions.map((sq) => (
            <div key={sq.id} className={styles.sharedQuestionBlock}>
              <div className={styles.questionHeader}>
                <input
                  className={styles.questionInput}
                  value={sq.question}
                  onChange={(e) => updateQuestion(sq.id, e.target.value)}
                  onFocus={() => setEditingId(sq.id)}
                  onBlur={() => setEditingId(null)}
                />
                <button 
                  className={styles.deleteBtn}
                  onClick={() => deleteSharedQuestion(sq.id)}
                >
                  Poista kysymys
                </button>
              </div>

              <div className={styles.answersSection}>
                <h4>Vastausvaihtoehdot:</h4>
                {sq.answers.map((answer, aIdx) => (
                  <div key={aIdx} className={styles.answerBlock}>
                    <input
                      className={styles.answerInput}
                      value={answer.text}
                      onChange={(e) => updateAnswer(sq.id, aIdx, e.target.value)}
                    />
                    <button
                      className={styles.deleteBtnSmall}
                      onClick={() => removeAnswer(sq.id, aIdx)}
                      disabled={sq.answers.length <= 1}
                    >
                      Poista
                    </button>
                  </div>
                ))}
                <button 
                  className={styles.addBtnSmall}
                  onClick={() => addAnswer(sq.id)}
                >
                  + Lisää vastaus
                </button>
              </div>

              <div className={styles.usageInfo}>
                <small>ID: {sq.id}</small>
              </div>
            </div>
          ))}
        </div>

        {sharedQuestions.length === 0 && (
          <div className={styles.emptyState}>
            <p>Ei jaettuja kysymyksiä.</p>
            <button className={styles.addBtn} onClick={addNewSharedQuestion}>
              Luo ensimmäinen jaettu kysymys
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedQuestionsManager;