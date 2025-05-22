'use client';
import '@/app/styles/createnew.css';
import { useState } from 'react';

export default function CreateNewPage() {
  const [inputValue, setInputValue] = useState<string>('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGeneral, setIsGeneral] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); // Start loading
  
    try {
      const res = await fetch('/api/createquestionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue, isGeneral }),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        setError(result.error || 'An error occurred');
      } else {
        setSuccess(result.message);
        setInputValue('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    } finally {
      setLoading(false); // Stop loading
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
