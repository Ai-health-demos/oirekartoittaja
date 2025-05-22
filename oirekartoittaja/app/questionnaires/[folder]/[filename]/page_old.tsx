'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/questionnaires/QuestionnaireEditor.module.css'

const QuestionnaireEditor = () => {
  const { folder, filename } = useParams();
  const [questionnaire, setQuestionnaire] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/questionnaires/${folder}/${filename}`)
      .then((res) => res.json())
      .then(setQuestionnaire)
      .catch(console.error);
  }, [folder, filename]);

  const handleQuestionChange = (index: number, value: string) => {
    setQuestionnaire((prev: any) => {
      const updated = { ...prev };
      updated.questions[index].question = value;
      return updated;
    });
  };

  const addQuestion = (index: number) => {
    setQuestionnaire((prev: any) => {
      const updated = { ...prev };
      updated.questions.splice(index + 1, 0, {
        id: crypto.randomUUID(),
        question: 'New Question',
        answers: [{ text: 'Answer', followUpQuestionIds: [] }],
      });
      return updated;
    });
  };

  const deleteQuestion = (index: number) => {
    setQuestionnaire((prev: any) => {
      const updated = { ...prev };
      updated.questions.splice(index, 1);
      return updated;
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

  if (!questionnaire) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <Link href="/questionnaires">← Back to List</Link>
      </nav>
      <main className={styles.mainContent}>
        <h2>{questionnaire.topic}</h2>
        {questionnaire.questions.map((q: any, i: number) => (
          <div key={q.id} className={styles.questionBlock}>
            <input
              type="text"
              className={styles.questionInput}
              value={q.question}
              onChange={(e) => handleQuestionChange(i, e.target.value)}
            />
            <button className={styles.deleteBtn} onClick={() => deleteQuestion(i)}>
              Delete
            </button>
            <button className={styles.addBtn} onClick={() => addQuestion(i)}>
              +
            </button>
          </div>
        ))}
        <button className={styles.saveBtn} onClick={saveChanges}>
          Save Changes
        </button>
      </main>
    </div>
  );
};

export default QuestionnaireEditor;
