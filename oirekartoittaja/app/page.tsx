'use client';

import Head from 'next/head';
import styles from '@/app/styles/Home.module.css';
import compStyles from '@/app/styles/Conversation.module.css';
import Conversation from './components/Conversation4';
import { useState, useEffect } from 'react';

interface StoredQuestionnaire {
  key: string;
  data: any;
}

export default function Home() {
  const [questionnaires, setQuestionnaires] = useState<StoredQuestionnaire[]>([]);
  const [selected, setSelected] = useState<StoredQuestionnaire | null>(null);

  useEffect(() => {
    const items: StoredQuestionnaire[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('questionnaire_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            items.push({ key, data });
          } catch (err) {
            console.error(`Failed to parse questionnaire ${key}`);
          }
        }
      }
    }
    // Sort newest first
    items.sort((a, b) => (b.key > a.key ? 1 : -1));
    setQuestionnaires(items);
  }, []);

  return (
    <>
      <Head>
        <title>Oirekartoittaja</title>
      </Head>
      <main className={styles.mainLayout}>
        <h1 className={styles.gradient_title}>Oirekartoittaja</h1>

        {!selected ? (
          <>
            <p className={styles.subtitle}>Valitse tallennettu kysely listasta</p>
            <div className={compStyles.buttonStack}>
              {questionnaires.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelected(item)}
                  className={compStyles.gradient_button}
                >
                  {item.key}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.selectedContainer}>
            <button
              className={compStyles.gradient_button}
              onClick={() => setSelected(null)}
            >
              ← Takaisin
            </button>
            <Conversation file={selected} />

            {/* <div className={compStyles.conversationBox}>
              <h2>{selected.key}</h2>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(selected.data, null, 2)}
              </pre>
            </div> */}
          </div>
        )}
      </main>
    </>
  );
}
