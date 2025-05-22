'use client';
import '@/app/styles/createnew.css';
import { useState } from 'react';

export default function CreateNewPage() {
  const [inputValue, setInputValue] = useState<string>('');
  const [passKey, setPassKey] = useState<string>('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGeneral, setIsGeneral] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
  
    try {
      // Step 1: Get count of questionnaires in localStorage
      const storedKeys = Object.keys(localStorage).filter(key => key.startsWith('questionnaire_'));
      const questionnaireCount = storedKeys.length;
  
      // Step 2: Send count with request
      const res = await fetch('/api/createquestionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue, isGeneral, questionnaireCount, passKey }),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        setError(result.error || 'An error occurred');
      } else {
        // Step 3: Save to localStorage
        const newKey = `questionnaire_${Date.now()}`;
        localStorage.setItem(newKey, JSON.stringify(result.generatedQuestionnaire));
        setSuccess(result.message);
        setInputValue('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="second-page-title">Luo uusi oirekysely</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          className="centered-box"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Kirjoita tähän AIHE. (Silmäsairaudet, ihosairaudet, yleisen voinnin kysely...)"
        />

        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="questionnaireType"
              value="general"
              checked={isGeneral}
              onChange={() => setIsGeneral(true)}
            />
            <p>Yleinen kysely</p>
          </label>

          <label>
            <input
              type="radio"
              name="questionnaireType"
              value="specific"
              checked={!isGeneral}
              onChange={() => setIsGeneral(false)}
            />
            <p>Oirespesifi kysely</p>
          </label>
        </div>

        <textarea
          className="centered-box"
          value={passKey}
          onChange={(e) => setPassKey(e.target.value)}
          placeholder="Kirjoita tähän saamasi pääsyavain"
        />

        <button className="create-button" type="submit" disabled={loading}>
          Luo uusi oirekysely
        </button>

        { loading &&       
          <div className="spinner-container">
            <h3>Uutta oirekyselyä luodaan...</h3>
            <div className="spinner" />
          </div>
        }

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
}
