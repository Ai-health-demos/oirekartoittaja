"use client"
import Head from 'next/head';
import styles from '@/app/styles/Home.module.css';
import compStyles from '@/app/styles/Conversation.module.css';
import { useState, useEffect } from 'react';
import Conversation from './components/Conversation3';
// import { QuestionnaireFolder } from './questionnaires/page';

interface QuestionnaireFolder {
  folder: string;
  files: string[];
}

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireFolder[]>([]);

  useEffect(() => {
    fetch('/questionnaires/api')
      .then((res) => res.json())
      .then(setQuestionnaires)
      .catch(console.error);
  }, []);

  const handleClick = (value: string) => {
    setSelected(value);
  };

  const mockCategories = ['Silmät', 'Hengitystiet', 'Iho'];

  return (
    <>
      <Head>
        <title>Oirekartoittaja</title>
      </Head>
      <main className={styles.mainLayout}>
        <h1 className={styles.gradient_title}>Oirekartoittaja</h1>
        {!selected ? (
          <>
            <p className={styles.subtitle}>Valitse listasta kysely ja testaa</p>
            <div className={compStyles.buttonStack}>
              {mockCategories.map(btn => (
                <button key={btn} onClick={() => handleClick(btn)} className={compStyles.gradient_button}>
                  {btn}
                </button>
              ))}
            </div>
            
          </>
        ) : (
          <div className={styles.selectedContainer}>
            <button className={compStyles.gradient_button}>{selected}</button>
            <Conversation/>
          </div>
        )}
      </main>
    </>
  );
}
