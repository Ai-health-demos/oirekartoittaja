'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/styles/QuestionEditor.module.css';

type Answer = {
  text: string;
  followUpQuestionIds?: string[];
};

type Question = {
  id: string;
  question: string;
  answers: Answer[];
};

type Questionnaire = {
  questionnaireType: string;
  topic: string;
  questions: Question[];
};

const QuestionnaireEditor = () => {
  const { folder, filename } = useParams();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);

  useEffect(() => {
    fetch(`/api/questionnaires/${folder}/${filename}`)
      .then(res => res.json())
      .then(setQuestionnaire)
      .catch(console.error);
  }, [folder, filename]);

  const updateQuestion = (qIdx: number, value: string) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.questions[qIdx].question = value;
      return updated;
    });
  };

  const updateAnswer = (qIdx: number, aIdx: number, value: string) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.questions[qIdx].answers[aIdx].text = value;
      return updated;
    });
  };

  const addQuestionBlock = (index: number) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: [
          ...prev.questions.slice(0, index + 1),
          {
            id: crypto.randomUUID(),
            question: 'Uusi kysymys',
            answers: [{ text: 'Uusi vastaus' }],
          },
          ...prev.questions.slice(index + 1),
        ],
      };
    });
  };
  
  const addAnswer = (qIdx: number, aIdx: number) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;
      const updatedQuestions = prev.questions.map((q, idx) => {
        if (idx === qIdx) {
          return {
            ...q,
            answers: [
              ...q.answers.slice(0, aIdx + 1),
              { text: 'Uusi vastaus' },
              ...q.answers.slice(aIdx + 1),
            ],
          };
        }
        return q;
      });
      return { ...prev, questions: updatedQuestions };
    });
  };
  
  const deleteQuestion = (index: number) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.filter((_, idx) => idx !== index),
      };
    });
  };
  
  const deleteAnswer = (qIdx: number, aIdx: number) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;
      const updatedQuestions = prev.questions.map((q, idx) => {
        if (idx === qIdx) {
          return {
            ...q,
            answers: q.answers.filter((_, idx2) => idx2 !== aIdx),
          };
        }
        return q;
      });
      return { ...prev, questions: updatedQuestions };
    });
  };  

  const saveChanges = () => {
    fetch(`/api/questionnaires/${folder}/${filename}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionnaire),
    })
      .then(() => alert('Saved!'))
      .catch(() => alert('Error saving.'));
  };

  if (!questionnaire) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <Link href="/questionnaires">← Takaisin listaan</Link>
      </nav>
      <main className={styles.mainContent}>
        <h2>{questionnaire.topic}</h2>
        {questionnaire.questions.map((q, qIdx) => (
          <React.Fragment key={q.id}>
            <div className={styles.questionBlock}>
              <input
                className={styles.questionInput}
                value={q.question}
                onChange={(e) => updateQuestion(qIdx, e.target.value)}
              />
              <button className={styles.deleteBtn} onClick={() => deleteQuestion(qIdx)}>Poista kysymys</button>
              {q.answers.map((ans, aIdx) => (
                <div key={aIdx} className={styles.answerBlock}>
                  <input
                    className={styles.answerInput}
                    value={ans.text}
                    onChange={(e) => updateAnswer(qIdx, aIdx, e.target.value)}
                  />
                  <button className={styles.deleteBtnSmall} onClick={() => deleteAnswer(qIdx, aIdx)}>Poista vastaus</button>
                  <button className={styles.addBtnSmall} onClick={() => addAnswer(qIdx, aIdx)}>+ Lisää vastaus</button>
                </div>
              ))}
            </div>
            <button className={styles.addBtn} onClick={() => addQuestionBlock(qIdx)}>+ Lisää uusi kysymys</button>
          </React.Fragment>
        ))}
        <br></br>
        <button className={styles.saveBtn} onClick={saveChanges}>Tallenna muutokset</button>
      </main>
    </div>
  );
};

export default QuestionnaireEditor;
