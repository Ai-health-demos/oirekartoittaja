"use client";

import { MedicalQuestionnaire } from "@/app/schema/shcema2";
import { useState } from "react";
import styles from "./page.module.css";

interface ConversionResult {
  format?: "json" | "text";
  topic: string;
  content?: string; // For text format
  questions?: Array<{
    id: string;
    question: string;
    answers: Array<{
      text: string;
      followUpQuestions?: any[];
    }>;
  }>;
  questionnaireType?: "overallHealth" | "symptomFocused";
}

function Page() {
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [topic, setTopic] = useState("Oirekysely");
  const [includeAllSections, setIncludeAllSections] = useState(false);
  const [outputFormat, setOutputFormat] = useState<"json" | "text">("json");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleAdditionalFilesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAdditionalFiles((prev) => [...prev, ...newFiles]);
    }
    // Reset the input to allow selecting the same files again if needed
    e.target.value = "";
  };

  const removeAdditionalFile = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainFile) {
      setError("Valitse päätiedosto GraphML-muodossa");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("main_file", mainFile);
      formData.append("topic", topic);
      formData.append("output_format", outputFormat);
      formData.append("include_all_sections", includeAllSections.toString());
      if (additionalFiles.length > 0) {
        additionalFiles.forEach((file) => {
          formData.append("additional_files", file);
        });
      }      console.log("formdata", formData);

      const response = await fetch("/api/python/v1/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Conversion failed");
      }      const data = await response.json();
      setResult(data);
      
      // Show save dialog only for JSON format
      if (data.format === "json" || outputFormat === "json") {
        setShowSaveDialog(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;

    let dataStr: string;
    let filename: string;
    let mimeType: string;

    if (result.format === "text") {
      dataStr = result.content || "";
      filename = `${result.topic.replace(/\s+/g, "_")}_questionnaire.md`;
      mimeType = "text/markdown";
    } else {
      dataStr = JSON.stringify(result, null, 2);
      filename = `${result.topic.replace(/\s+/g, "_")}_questionnaire.json`;
      mimeType = "application/json";
    }    const dataBlob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveToLocalStorage = () => {
    if (!result || result.format === "text") return;
    
    try {
      // Convert to the expected format
      const questionnaire: MedicalQuestionnaire = {
        questionnaireType: result.questionnaireType || "overallHealth",
        topic: result.topic,
        questions: result.questions || []
      };
      
      const newKey = `questionnaire_${Date.now()}`;
      localStorage.setItem(newKey, JSON.stringify(questionnaire));
      setSaveSuccess(`Kysely tallennettu avaimella: ${newKey}`);
      setShowSaveDialog(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      setError("Virhe tallentaessa kyselyä");
    }
  };

  const cancelSave = () => {
    setShowSaveDialog(false);
  };
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {" "}
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>📋 GraphML Muunnin</h1>
          <p className={styles.subtitle}>
            Muunna yEd GraphML -kyselytiedostot JSON- tai teksti-muotoon
          </p>
        </div>
        {/* Help Section */}
        <div className={styles.helpSection}>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className={styles.helpButton}
          >
            {showHelp ? "📚 Piilota ohje" : "❓ Näytä muunnosprosessin ohje"}
          </button>

          {showHelp && (
            <div className={styles.helpContent}>
              <h3>🔄 GraphML-muunnosprosessi</h3>
              <p>
                Tämä työkalu muuntaa yEd:llä luodut GraphML-kyselytiedostot
                JSON- tai Markdown-muotoon.
              </p>

              <h4>📁 Tiedostotyypit:</h4>
              <ul>
                <li>
                  <strong>Päätiedosto:</strong> Pääkysely GraphML-muodossa
                  (pakollinen)
                </li>
                <li>
                  <strong>Lisätiedostot:</strong> Viitetiedostot, joihin
                  päätiedosto linkittää (valinnainen)
                </li>
              </ul>

              <h4>🔗 ALKU/LOPPU-viittaukset:</h4>
              <p>
                GraphML-tiedostoissa voit käyttää ALKU/LOPPU-viittauksia
                linkittämään toisiinsa liittyviä kyselyitä:
              </p>
              <ul>
                <li>
                  <strong>ALKU:</strong> Viittaa toiseen GraphML-tiedostoon
                  kyselyn alusta
                </li>
                <li>
                  <strong>LOPPU:</strong> Viittaa toiseen GraphML-tiedostoon
                  kyselyn lopusta
                </li>
              </ul>

              <h4>⚙️ Käyttö:</h4>
              <ol>
                <li>
                  Valitse tulosteen muoto (JSON rakenteellista dataa, Markdown
                  tekstiä varten)
                </li>
                <li>Lataa päätiedosto (.graphml)</li>
                <li>Lisää tarvittaessa viitetiedostoja</li>
                <li>Anna kyselylle nimi</li>
                <li>Paina "Muunna" ja lataa tulokset</li>
              </ol>

              <h4>📊 Tulosteen muodot:</h4>
              <ul>
                <li>
                  <strong>JSON:</strong> Strukturoitu data, sopii ohjelmalliseen
                  käyttöön
                </li>
                <li>
                  <strong>Markdown:</strong> Luettava teksti, sopii
                  dokumentointiin. Voit helposti kopioida ja liittää
                  Markdown-tulosteen esimerkiksi ChatGPT:lle ja parantaa kyselyä
                  tekoälyn avulla.
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {" "}
            {/* Output Format Selection */}
            <div className={styles.formGroup}>
              <label className={styles.label}>🔄 Tulosteen muoto</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    value="json"
                    checked={outputFormat === "json"}
                    onChange={(e) =>
                      setOutputFormat(e.target.value as "json" | "text")
                    }
                    className={styles.radioInput}
                  />
                  📊 JSON (rakenne-data)
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    value="text"
                    checked={outputFormat === "text"}
                    onChange={(e) =>
                      setOutputFormat(e.target.value as "json" | "text")
                    }
                    className={styles.radioInput}
                  />
                  📝 Teksti (Markdown)
                </label>
              </div>
            </div>
            {/* Main File Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                📁 Päätiedosto GraphML-muodossa *
              </label>
              <input
                type="file"
                accept=".graphml"
                onChange={(e) => setMainFile(e.target.files?.[0] || null)}
                className={styles.fileInput}
                required
              />
            </div>{" "}
            {/* Additional Files */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                📂 Lisätiedostot GraphML-muodossa (valinnainen)
              </label>
              <input
                type="file"
                accept=".graphml"
                multiple
                onChange={handleAdditionalFilesChange}
                className={styles.fileInput}
              />
              {/* Display selected additional files */}
              {additionalFiles.length > 0 && (
                <div className={styles.fileList}>
                  <h4 className={styles.fileListTitle}>Valitut tiedostot:</h4>
                  {additionalFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className={styles.fileItem}
                    >
                      <span className={styles.fileName}>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAdditionalFile(index)}
                        className={styles.removeFileButton}
                        aria-label={`Poista ${file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}{" "}
            </div>
            {/* Topic Input */}
            <div className={styles.formGroup}>
              <label className={styles.label}>🏷️ Kyselyn nimi</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={styles.textInput}
                placeholder="Kirjoita kyselyn nimi"
              />
            </div>
            {/* Include All Sections */}
            <div className={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id="includeAllSections"
                checked={includeAllSections}
                onChange={(e) => setIncludeAllSections(e.target.checked)}
                className={styles.checkbox}
              />{" "}
              <label
                htmlFor="includeAllSections"
                className={styles.checkboxLabel}
              >
                Sisällytä kaikki osiot kaikista tiedostoista (myös tyhjät
                kysymykset)
              </label>
            </div>
            {/* Submit Button */}{" "}
            <button
              type="submit"
              disabled={loading || !mainFile}
              className={styles.submitButton}
            >
              {loading
                ? "⏳ Käsitellään..."
                : `🚀 Muunna ${
                    outputFormat === "json" ? "JSON:ksi" : "tekstiksi"
                  }`}
            </button>
          </form>
        </div>
      </div>{" "}
      {/* Error Display */}
      {error && (
        <div className={styles.errorCard}>
          <h3 className={styles.errorTitle}>❌ Virhe</h3>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      )}
      {/* Results Display */}
      {result && (
        <div className={styles.successCard}>
          <div className={styles.successHeader}>
            <div>
              <h3 className={styles.successTitle}>✅ Muunnos onnistui!</h3>
              <p className={styles.successInfo}>
                Kysely: <strong>{result.topic}</strong>
              </p>
              <p className={styles.successInfo}>
                Muoto: <strong>{result.format?.toUpperCase() || "JSON"}</strong>
              </p>
              {result.format === "json" ? (
                <>
                  <p className={styles.successInfo}>
                    Kysymyksiä löytyi:{" "}
                    <strong>{result.questions?.length || 0}</strong>
                  </p>
                  <p className={styles.successInfo}>
                    Tyyppi: <strong>{result.questionnaireType}</strong>
                  </p>
                </>
              ) : (
                <p className={styles.successInfo}>
                  Sisällön pituus:{" "}
                  <strong>{result.content?.length || 0} merkkiä</strong>
                </p>
              )}
            </div>            <button onClick={downloadResult} className={styles.downloadButton}>
              📥 Lataa {result.format === "text" ? "Markdown" : "JSON"}
            </button>
            {result.format === "json" && (
              <button onClick={() => setShowSaveDialog(true)} className={styles.downloadButton}>
                💾 Tallenna sovellukseen
              </button>            )}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className={styles.successCard}>
          <div className={styles.successHeader}>
            <div>
              <h3 className={styles.successTitle}>💾 Tallenna kysely sovellukseen</h3>
              <p className={styles.successInfo}>
                Haluatko tallentaa kyselyn "{result?.topic}" sovelluksen muistiin? 
                Voit myöhemmin muokata ja käyttää sitä kyselyiden tekemiseen.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={saveToLocalStorage} className={styles.downloadButton}>
                ✅ Kyllä, tallenna
              </button>
              <button onClick={cancelSave} className={styles.downloadButton} style={{ background: '#6b7280' }}>
                ❌ Ei kiitos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Message */}
      {saveSuccess && (
        <div className={styles.successCard}>
          <div className={styles.successHeader}>
            <div>
              <h3 className={styles.successTitle}>✅ Tallennus onnistui!</h3>
              <p className={styles.successInfo}>{saveSuccess}</p>
              <p className={styles.successInfo}>
                Voit nyt siirtyä <a href="/editor" style={{ color: '#2563eb', textDecoration: 'underline' }}>kyselyiden hallintaan</a> muokataksesi tai käyttääksesi kyselyä.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
