'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/styles/QuestionEditor.module.css';
import { getSharedQuestions, saveSharedQuestions, getSharedQuestionById, SharedQuestion } from '@/app/lib/sharedQuestions';

type Answer = {
  text: string;
  followUpParent?: { parentQuestionId: string; parentAnswerText: string };
};

type Question = {
  id: string;
  question: string;
  answers: Answer[];
  followUpParent?: { parentQuestionId: string; parentAnswerText: string };
  isShared?: boolean; // Merkitsee onko jaettu kysymys
  sharedId?: string; // Viittaus jaettuun kysymykseen
};

type Questionnaire = {
  questionnaireType: string;
  topic: string;
  questions: Question[];
};

const QuestionnaireEditor = () => {
  const params = useParams();
  const key = typeof params?.key === 'string' ? params.key : Array.isArray(params?.key) ? params.key[0] : '';
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [sharedQuestions, setSharedQuestions] = useState<SharedQuestion[]>([]);
  const [showSharedQuestions, setShowSharedQuestions] = useState(false);

  // Lataa jaetut kysymykset
  useEffect(() => {
    setSharedQuestions(getSharedQuestions());
  }, []);

  useEffect(() => {
    if (!key) return;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      const flatQuestions: Question[] = [];

      const flatten = (q: Question, parent?: { parentQuestionId: string; parentAnswerText: string }) => {
        const flatQ: Question = {
          id: q.id,
          question: q.question,
          answers: q.answers.map(a => ({ text: a.text })),
          followUpParent: parent,
        };

        flatQuestions.push(flatQ);

        q.answers.forEach(a => {
          const followUps = (a as { followUpQuestions?: Question[] }).followUpQuestions;
          if (followUps && Array.isArray(followUps)) {
            followUps.forEach(fq =>
              flatten(fq, { parentQuestionId: q.id, parentAnswerText: a.text })
            );
          }
        });
      };

      data.questions.forEach((q: Question) => flatten(q));
      setQuestionnaire({ ...data, questions: flatQuestions });
    } catch (err) {
      console.error('Failed to load questionnaire from localStorage');
    }
  }, [key]);

  // ... (everything else remains the same)

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

  const addAnswer = (qIdx: number, aIdx: number) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        questions: prev.questions.map((q, i) => {
          if (i !== qIdx) return q;
          return {
            ...q,
            answers: [
              ...q.answers.slice(0, aIdx + 1),
              { text: 'Uusi vastaus' },
              ...q.answers.slice(aIdx + 1),
            ],
          };
        }),
      };

      return updated;
    });
  };

  const addFollowUpQuestion = (qIdx: number, aIdx: number) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;

      const updated = { ...prev, questions: [...prev.questions] };
      const parentQ = updated.questions[qIdx];
      const parentA = parentQ.answers[aIdx];

      const exists = updated.questions.some(
        q =>
          q.followUpParent?.parentQuestionId === parentQ.id &&
          q.followUpParent?.parentAnswerText === parentA.text
      );
      if (exists) return prev;

      const newFollowUp: Question = {
        id: crypto.randomUUID(),
        question: 'Uusi jatkokysymys',
        answers: [{ text: 'Uusi vastaus' }],
        followUpParent: {
          parentQuestionId: parentQ.id,
          parentAnswerText: parentA.text,
        },
      };

      let insertIdx = qIdx + 1;
      while (
        insertIdx < updated.questions.length &&
        updated.questions[insertIdx].followUpParent?.parentQuestionId === parentQ.id
      ) {
        insertIdx++;
      }

      updated.questions.splice(insertIdx, 0, newFollowUp);

      return updated;
    });
  };

  const deleteQuestion = (qIdx: number) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      const toDelete = updated.questions[qIdx].id;
      updated.questions = updated.questions.filter(
        q => q.id !== toDelete && q.followUpParent?.parentQuestionId !== toDelete
      );
      return updated;
    });
  };

  const deleteAnswer = (qIdx: number, aIdx: number) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.questions[qIdx].answers.splice(aIdx, 1);
      return updated;
    });
  };

  const addQuestionBlock = (index: number) => {
    setQuestionnaire(prev => {
      if (!prev) return prev;
      const newQuestion = {
        id: crypto.randomUUID(),
        question: 'Uusi kysymys',
        answers: [{ text: 'Uusi vastaus' }],
      };
      return {
        ...prev,
        questions: [
          ...prev.questions.slice(0, index + 1),
          newQuestion,
          ...prev.questions.slice(index + 1),
        ],
      };
    });
  };

  // Jaa kysymys jaettuihin kysymyksiin
  const shareQuestion = (qIdx: number) => {
    if (!questionnaire) return;
    
    const question = questionnaire.questions[qIdx];
    if (question.isShared) return; // Jo jaettu
    
    const sharedQuestion: SharedQuestion = {
      id: `shared_${Date.now()}`,
      question: question.question,
      answers: question.answers.map(a => ({ text: a.text })),
      isShared: true
    };
    
    const updatedShared = [...sharedQuestions, sharedQuestion];
    setSharedQuestions(updatedShared);
    saveSharedQuestions(updatedShared);
    
    // Merkitse kysymys jaetuksi
    setQuestionnaire(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.questions[qIdx] = {
        ...question,
        isShared: true,
        sharedId: sharedQuestion.id
      };
      return updated;
    });
  };

  // Lisää jaettu kysymys kyselyyn
  const addSharedQuestion = (sharedId: string, index: number) => {
    const shared = getSharedQuestionById(sharedId);
    if (!shared) return;
    
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question: shared.question,
      answers: shared.answers.map(a => ({ text: a.text })),
      isShared: true,
      sharedId: shared.id
    };
    
    setQuestionnaire(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: [
          ...prev.questions.slice(0, index + 1),
          newQuestion,
          ...prev.questions.slice(index + 1),
        ],
      };
    });
    setShowSharedQuestions(false);
  };

  // Päivitä jaettu kysymys
  const updateSharedQuestion = (sharedId: string, newQuestion: string, newAnswers: Array<{text: string}>) => {
    const updatedShared = sharedQuestions.map(sq => 
      sq.id === sharedId 
        ? { ...sq, question: newQuestion, answers: newAnswers }
        : sq
    );
    setSharedQuestions(updatedShared);
    saveSharedQuestions(updatedShared);
    
    // Päivitä kaikki kyselyssä olevat jaetut kysymykset
    setQuestionnaire(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.questions = updated.questions.map(q => 
        q.sharedId === sharedId 
          ? { ...q, question: newQuestion, answers: newAnswers.map(a => ({ text: a.text })) }
          : q
      );
      return updated;
    });
  };

  const saveChanges = () => {
    if (!questionnaire || !key) return;

    const mainQuestions = questionnaire.questions
      .filter(q => !q.followUpParent)
      .map(q => ({
        id: q.id,
        question: q.question,
        answers: q.answers.map(a => ({ text: a.text })),
      }));

    questionnaire.questions
      .filter(q => q.followUpParent)
      .forEach(fq => {
        const { parentQuestionId, parentAnswerText } = fq.followUpParent!;
        const parentQ = mainQuestions.find(q => q.id === parentQuestionId);
        const parentA = parentQ?.answers.find(a => a.text === parentAnswerText);

        if (parentA) {
          if (!('followUpQuestions' in parentA)) {
            (parentA as any).followUpQuestions = [];
          }
          (parentA as any).followUpQuestions.push({
            id: fq.id,
            question: fq.question,
            answers: fq.answers.map(a => ({ text: a.text })),
          });
        }
      });

    const restored: Questionnaire = {
      questionnaireType: questionnaire.questionnaireType,
      topic: questionnaire.topic,
      questions: mainQuestions,
    };

    localStorage.setItem(key, JSON.stringify(restored, null, 2));
    alert('Tallennettu!');
  };

  if (!questionnaire) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <Link href="/editor">← Takaisin listaan</Link>
        <Link href="/editor/shared" className={styles.sharedLink}>
          📌 Hallitse jaettuja kysymyksiä
        </Link>
      </nav>
      <main className={styles.mainContent}>
        <h2>{questionnaire.topic}</h2>
        {questionnaire.questions.map((q, qIdx) => {
          const isFollowUp = !!q.followUpParent;
          return (
            <React.Fragment key={q.id}>
              <div
                className={
                  isFollowUp
                    ? `${styles.questionBlock} ${styles.followUpBlock}`
                    : styles.questionBlock
                }
              >
                {isFollowUp && (
                  <div className={styles.followUpLabel}>
                    Jatkokysymys vastaukselle: "{q.followUpParent?.parentAnswerText}"
                  </div>
                )}
                <input
                  className={styles.questionInput}
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, e.target.value)}
                />
                <div className={styles.questionButtons}>
                  {q.isShared && (
                    <span className={styles.sharedLabel}>📌 Jaettu kysymys</span>
                  )}
                  {!q.isShared && !isFollowUp && (
                    <button 
                      className={styles.shareBtn} 
                      onClick={() => shareQuestion(qIdx)}
                      title="Jaa kysymys käytettäväksi muissa kyselyissä"
                    >
                      📌 Jaa kysymys
                    </button>
                  )}
                  <button className={styles.deleteBtn} onClick={() => deleteQuestion(qIdx)}>
                    Poista kysymys
                  </button>
                </div>
                {q.answers.map((a, aIdx) => (
                  <div key={aIdx} className={styles.answerBlock}>
                    <input
                      className={styles.answerInput}
                      value={a.text}
                      onChange={(e) => updateAnswer(qIdx, aIdx, e.target.value)}
                    />
                    <button
                      className={styles.deleteBtnSmall}
                      onClick={() => deleteAnswer(qIdx, aIdx)}
                    >
                      Poista vastaus
                    </button>
                    <button
                      className={styles.addBtnSmall}
                      onClick={() => addAnswer(qIdx, aIdx)}
                    >
                      + Lisää vastaus
                    </button>
                    {!isFollowUp && (
                      <button
                        className={styles.addBtnSmall}
                        onClick={() => addFollowUpQuestion(qIdx, aIdx)}
                      >
                        + Lisää jatkokysymys
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!isFollowUp && (
                <>
                  <button className={styles.addBtn} onClick={() => addQuestionBlock(qIdx)}>
                    + Lisää uusi kysymys
                  </button>
                  <button 
                    className={styles.addSharedBtn} 
                    onClick={() => setShowSharedQuestions(true)}
                  >
                    📌 Lisää jaettu kysymys
                  </button>
                </>
              )}
            </React.Fragment>
          );
        })}
        <br />
        <button className={styles.saveBtn} onClick={saveChanges}>
          Tallenna muutokset
        </button>
      </main>

      {/* Modal jaetuille kysymyksille */}
      {showSharedQuestions && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Valitse jaettu kysymys</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowSharedQuestions(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {sharedQuestions.length === 0 ? (
                <p>Ei jaettuja kysymyksiä. Jaa ensin kysymys käyttämällä "📌 Jaa kysymys" -painiketta.</p>
              ) : (
                <div className={styles.sharedQuestionsList}>
                  {sharedQuestions.map((sq) => (
                    <div key={sq.id} className={styles.sharedQuestionItem}>
                      <h4>{sq.question}</h4>
                      <div className={styles.answersPreview}>
                        {sq.answers.map((a, idx) => (
                          <span key={idx} className={styles.answerChip}>
                            {a.text}
                          </span>
                        ))}
                      </div>
                      <button 
                        className={styles.selectBtn}
                        onClick={() => addSharedQuestion(sq.id, questionnaire?.questions.length - 1 || 0)}
                      >
                        Valitse
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionnaireEditor;
