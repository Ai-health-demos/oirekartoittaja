'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/styles/QuestionEditor.module.css';

type Answer = {
  text: string;
  followUpParent?: { parentQuestionId: string; parentAnswerText: string };
};

type Question = {
  id: string;
  question: string;
  answers: Answer[];
  followUpParent?: { parentQuestionId: string; parentAnswerText: string };
  locked?: boolean;
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
  const [lockedQuestions, setLockedQuestions] = useState<Question[]>([]);

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

      //load locked questions
      const lockedKeys = Object.keys(localStorage).filter(k => k.startsWith('locked_'));
        const loadedLocked = lockedKeys.map(k => {
            try {
            return JSON.parse(localStorage.getItem(k) ?? '');
            } catch {
            return null;
            }
        }).filter(Boolean);
        setLockedQuestions(loadedLocked);
    } catch (err) {
      console.error('Failed to load questionnaire from localStorage');
    }
  }, [key]);

  const addLockedQuestion = () => {
    setLockedQuestions(prev => [
      {
        id: crypto.randomUUID(),
        question: 'Lukittu kysymys',
        answers: [{ text: 'Uusi vastaus' }],
        locked: true,
      },
      ...prev,
    ]);
  };  

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

    if(lockedQuestions[0]){
        // --- Save locked questions separately ---
        lockedQuestions.forEach(q => {
            localStorage.setItem(`locked_${q.id}`, JSON.stringify(q));
        });
    }


    localStorage.setItem(key, JSON.stringify(restored, null, 2));
    alert('Tallennettu!');
  };

  if (!questionnaire) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <Link href="/editor">← Takaisin listaan</Link>
      </nav>
      <main className={styles.mainContent}>
        <h2>{questionnaire.topic}</h2>
        <button
    className={styles.addBtn}
    style={{ marginBottom: '1rem' }}
    onClick={addLockedQuestion}
    type="button"
  >
    Lisää lukittu kysymys
  </button>

  {lockedQuestions.length > 0 && (
    <div
      className={styles.lockedContainer}
      style={{
        marginBottom: '2rem',
        borderBottom: '2px solid #ccc',
        paddingBottom: '2rem'
      }}
    >
      <h3 style={{ marginBottom: '1rem' }}>Lukitut kysymykset</h3>
      {lockedQuestions.map((q, qIdx) => (
        <div
          key={q.id}
          className={`${styles.questionBlock} ${styles.followUpBlock}`}
        >
          <input
            className={styles.questionInput}
            value={q.question}
            onChange={e =>
              setLockedQuestions(prev => {
                const updated = [...prev];
                updated[qIdx].question = e.target.value;
                return updated;
              })
            }
          />
          <button
            className={styles.deleteBtn}
            onClick={() =>
              setLockedQuestions(prev =>
                prev.filter((_, idx) => idx !== qIdx)
              )
            }
          >
            Poista kysymys
          </button>
          {q.answers.map((a, aIdx) => (
            <div key={aIdx} className={styles.answerBlock}>
              <input
                className={styles.answerInput}
                value={a.text}
                onChange={e =>
                  setLockedQuestions(prev => {
                    const updated = [...prev];
                    updated[qIdx].answers[aIdx].text = e.target.value;
                    return updated;
                  })
                }
              />
              <button
                className={styles.deleteBtnSmall}
                onClick={() =>
                  setLockedQuestions(prev => {
                    const updated = [...prev];
                    updated[qIdx].answers.splice(aIdx, 1);
                    return updated;
                  })
                }
              >
                Poista vastaus
              </button>
              <button
                className={styles.addBtnSmall}
                onClick={() =>
                  setLockedQuestions(prev => {
                    const updated = [...prev];
                    updated[qIdx].answers.splice(aIdx + 1, 0, { text: 'Uusi vastaus' });
                    return updated;
                  })
                }
              >
                + Lisää vastaus
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )}
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
                <button className={styles.deleteBtn} onClick={() => deleteQuestion(qIdx)}>
                  Poista kysymys
                </button>
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
                <button className={styles.addBtn} onClick={() => addQuestionBlock(qIdx)}>
                  + Lisää uusi kysymys
                </button>
              )}
            </React.Fragment>
          );
        })}
        <br />
        <button className={styles.saveBtn} onClick={saveChanges}>
          Tallenna muutokset
        </button>
      </main>
    </div>
  );
};

export default QuestionnaireEditor;
