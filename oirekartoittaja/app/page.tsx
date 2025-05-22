'use client';
import Head from 'next/head';
import styles from '@/app/styles/Home.module.css';
import compStyles from '@/app/styles/Conversation.module.css';
import { useState, useEffect } from 'react';
import Conversation from './components/Conversation4';

interface QuestionnaireFolder {
  folder: string;
  files: string[];
}

interface ClickParameters {
    folder: string,
    fileName: string
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<{ folder: string, fileName: string } | null>(null);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireFolder[]>([]);

  useEffect(() => {
    fetch('/questionnaires/api')
      .then((res) => res.json())
      .then(setQuestionnaires)
      .catch(console.error);
  }, []);

  const handleClick = (clickObject : ClickParameters) => {
    setSelectedFile(clickObject);
  };

  return (
    <>
      <Head>
        <title>Oirekartoittaja</title>
      </Head>
      <main className={styles.mainLayout}>
        <h1 className={styles.gradient_title}>Oirekartoittaja</h1>
        {!selectedFile ? (
          <>
            <p className={styles.subtitle}>Valitse listasta kysely ja testaa</p>
            {questionnaires.map((folder) => (
              <div key={folder.folder}>
                <h2 className={styles.subtitle}>{folder.folder}</h2>
                <div className={compStyles.buttonStack}>
                  {folder.files.map((file) => (
                    <button
                      key={file}
                      onClick={() => handleClick({ folder: folder.folder, fileName: file })}
                      className={compStyles.gradient_button}
                    >
                      {file}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className={styles.selectedContainer}>
            <button
              className={compStyles.gradient_button}
              onClick={() => setSelectedFile(null)}
            >
              ← Takaisin
            </button>
            <Conversation file={selectedFile} />
          </div>
        )}
      </main>
    </>
  );
}
