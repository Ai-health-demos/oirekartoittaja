'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './QuestionnaireEditor.module.css';

export interface QuestionnaireFolder {
  folder: string;
  files: string[];
}

const QuestionnaireListing = () => {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireFolder[]>([]);

  useEffect(() => {
    fetch('/questionnaires/api')
      .then((res) => res.json())
      .then(setQuestionnaires)
      .catch(console.error);
  }, []);

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <h2>Questionnaires</h2>
        {questionnaires.map((group) => (
          <div key={group.folder}>
            <h3 className={styles.folder}>{group.folder}</h3>
            <ul>
              {group.files.map((file) => (
                <li key={file}>
                  <Link href={`/questionnaires/${group.folder}/${file}`}>
                    {file.replace('.json', '')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <main className={styles.mainContent}>
        <h3>Select a questionnaire from the sidebar.</h3>
      </main>
    </div>
  );
};

export default QuestionnaireListing;
