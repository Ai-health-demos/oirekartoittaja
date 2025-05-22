'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/styles/QuestionEditor.module.css';

interface StoredQuestionnaire {
  key: string;
  name: string;
}

const QuestionnaireListing = () => {
  const [questionnaires, setQuestionnaires] = useState<StoredQuestionnaire[]>([]);

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

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <h2>Questionnaires</h2>
        <ul>
          {questionnaires.map((q) => (
            <li key={q.key}>
              <Link href={`/editor/${encodeURIComponent(q.key)}`}>
                {q.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className={styles.mainContent}>
        <h3>Select a questionnaire from the sidebar to edit.</h3>
      </main>
    </div>
  );
};

export default QuestionnaireListing;
