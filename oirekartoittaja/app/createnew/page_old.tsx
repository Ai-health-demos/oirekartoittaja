"use client"
import '@/app/styles/createnew.css';
import { useState } from 'react';

export default function CreateNewPage() {
    const [inputValue, setInputValue] = useState<string>('');

    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      setError('');
      setSuccess('');
  
      try {
        const res = await fetch('/api/createquestionnaire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
  
        const result = await res.json();
  
        if (!res.ok) {
          setError(result.error || 'An error occurred');
        } else {
          setSuccess(result.message);
          setText('');
        }
      } catch (err) {
        setError('An unexpected error occurred');
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
            placeholder="Kirjoita tähän AIHE. (Silmäoireet, iho-oireet...)"
        />
        <button className="create-button" type='submit'>
            Luo uusi oirekysely
        </button>
      </form>
    </div>
  );
}
