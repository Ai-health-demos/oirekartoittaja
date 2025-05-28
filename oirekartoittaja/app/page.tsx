"use client"
import Head from 'next/head';
import styles from '@/app/styles/Home.module.css';
import compStyles from '@/app/styles/Conversation.module.css';
import Conversation from './components/Conversation4';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StoredQuestionnaire {
  key: string;
  data: any;
}

export default function Home() {
  const [questionnaires, setQuestionnaires] = useState<StoredQuestionnaire[]>([]);
  const [selected, setSelected] = useState<StoredQuestionnaire | null>(null);
  const router = useRouter();

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
    items.sort((a, b) => (b.key > a.key ? 1 : -1));
    setQuestionnaires(items);
  }, []);

  // STEP 1: Load and combine locked questions
  function getCombinedQuestions(selectedData: any) {
    // Get locked questions
    const locked: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('locked_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const lockedQ = JSON.parse(raw);
            locked.push(lockedQ);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
    // Add them to the start of questions array (if not already included)
    const originalQuestions = Array.isArray(selectedData.questions)
      ? selectedData.questions
      : [];
    // Optionally, remove duplicates by id
    const allQuestions = [
      ...locked.filter(
        lq => !originalQuestions.some((q: any) => q.id === lq.id)
      ),
      ...originalQuestions,
    ];
    // Return new data object
    return { ...selectedData, questions: allQuestions };
  }

  return (
    <>
      <Head>
        <title>Oirekartoittaja</title>
      </Head>
      <main className={styles.mainLayout}>
        <h1 className={styles.gradient_title}>Oirekartoittaja</h1>
        {!selected ? (
          questionnaires.length === 0 ? (
            <div className={compStyles.emptyState}>
              <p className={styles.subtitle}>
                Et ole luonut vielä kyselyjä, klikkaa tästä aloittaaksesi
              </p>
              <button
                className={compStyles.gradient_button}
                onClick={() => router.push('/createnew')}
              >
                Luo uusi kysely
              </button>
            </div>
          ) : (
            <>
              <p className={styles.subtitle}>Valitse tallennettu kysely listasta</p>
              <div className={compStyles.buttonStack}>
                {questionnaires.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelected(item)}
                    className={compStyles.gradient_button}
                  >
                    {item.data.topic || 'Nimetön kysely'}
                  </button>
                ))}
              </div>
            </>
          )
        ) : (
          <div className={styles.selectedContainer}>
            <button
              className={compStyles.gradient_button}
              onClick={() => setSelected(null)}
            >
              ← Takaisin
            </button>
            {/* STEP 2: Pass merged questions to Conversation */}
            <Conversation file={{ ...selected, data: getCombinedQuestions(selected.data) }} />
          </div>
        )}
      </main>
    </>
  );
}
