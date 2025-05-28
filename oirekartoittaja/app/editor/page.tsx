'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/QuestionEditor.module.css';

interface StoredQuestionnaire {
  key: string;
  topic: string;
}

const QuestionnaireListing = () => {
  const [questionnaires, setQuestionnaires] = useState<StoredQuestionnaire[]>([]);
  const router = useRouter();

  useEffect(() => {
    const items: StoredQuestionnaire[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('questionnaire_')) {
        const raw = localStorage.getItem(key);
        let topic = 'Nimetön'; // fallback if missing
        if (raw) {
          try {
            const data = JSON.parse(raw);
            topic = data.topic || 'Nimetön';
          } catch {
            // Ignore parse errors, use fallback
          }
        }
        items.push({
          key,
          topic,
        });
      }
    }
    items.sort((a, b) => (b.key > a.key ? 1 : -1));
    setQuestionnaires(items);
  }, []);

  const handleDelete = (keyToDelete: string) => {
    localStorage.removeItem(keyToDelete);
    setQuestionnaires((prev) => prev.filter((q) => q.key !== keyToDelete));
  };

  const handleDownload = (key: string) => {
    const data = localStorage.getItem(key);
    if (data) {
      let questionnaireObj;
      try {
        questionnaireObj = JSON.parse(data);
      } catch {
        questionnaireObj = null;
      }
      if (questionnaireObj && Array.isArray(questionnaireObj.questions)) {
        // Get locked questions
        const locked: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('locked_')) {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                const lockedQ = JSON.parse(raw);
                locked.push(lockedQ);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
        // Merge locked questions at start (avoid duplicates)
        const originalQuestions = questionnaireObj.questions;
        const allQuestions = [
          ...locked.filter(
            lq => !originalQuestions.some((q: any) => q.id === lq.id)
          ),
          ...originalQuestions,
        ];
        // New questionnaire object
        const downloadObj = { ...questionnaireObj, questions: allQuestions };
        const jsonStr = JSON.stringify(downloadObj, null, 2);

        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${key.replace('questionnaire_', '')}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // fallback: download raw data
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${key.replace('questionnaire_', '')}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <h2>Questionnaires</h2>
        <ul className={styles.questionnaireList}>
          {questionnaires.map((q) => (
            <li key={q.key} className={styles.questionnaireItem}>
              <div className={styles.itemRow}>
                <Link href={`/editor/${encodeURIComponent(q.key)}`}>
                  {/* Display topic, max 13 chars */}
                  {q.topic.length > 13 ? q.topic.slice(0, 13) : q.topic}
                </Link>
                <div>
                  <button
                    onClick={() => handleDownload(q.key)}
                    className={styles.downloadButton}
                    aria-label={`Lataa ${q.topic}`}
                  >
                    📥
                  </button>
                  <button
                    onClick={() => handleDelete(q.key)}
                    className={styles.deleteButton}
                    aria-label={`Poista ${q.topic}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <main className={styles.mainContent}>
        {questionnaires.length === 0 ? (
          <div className={styles.no_content_container}>
            <p>Et ole luonut vielä kyselyjä, klikkaa tästä aloittaaksesi</p>
            <button
              className={styles.gradient_button}
              onClick={() => router.push('/createnew')}
            >
              Luo uusi kysely
            </button>
          </div>
        ) : (
          <h3>Select a questionnaire from the sidebar to edit.</h3>
        )}
      </main>
    </div>
  );
};

export default QuestionnaireListing;
