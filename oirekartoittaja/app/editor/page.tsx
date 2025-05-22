'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/QuestionEditor.module.css'; // ensure this supports flex layout or modify as needed

interface StoredQuestionnaire {
  key: string;
  name: string;
}

const QuestionnaireListing = () => {
  const [questionnaires, setQuestionnaires] = useState<StoredQuestionnaire[]>([]);
  const router = useRouter();

  useEffect(() => {
    const items: StoredQuestionnaire[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('questionnaire_')) {
        items.push({
          key,
          name: key.replace('questionnaire_', '').replace('.json', ''),
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

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <h2>Questionnaires</h2>
        <ul className={styles.questionnaireList}>
          {questionnaires.map((q) => (
            <li key={q.key} className={styles.questionnaireItem}>
              <div className={styles.itemRow}>
                <Link href={`/editor/${encodeURIComponent(q.key)}`}>
                  {q.name}
                </Link>
                <button
                  onClick={() => handleDelete(q.key)}
                  className={styles.deleteButton}
                  aria-label={`Poista ${q.name}`}
                >
                  🗑️
                </button>
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
