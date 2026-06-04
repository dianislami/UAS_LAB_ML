'use client';

import { useState, useCallback, useEffect } from 'react';
import ResultCard from '@/components/ResultCard';

interface Prediction {
  class: string;
  prob: number;
}

interface ResultData {
  top_prediction: string;
  predictions: Prediction[];
  ai_insight: string;
}

interface HistoryItem {
  id: string;
  species: string;
  confidence: number;
  timestamp: number;
  preview: string;
  result: ResultData;
}

const SAMPLE_IMAGES = [
  { name: 'Semut', path: '/images/semut.jpg' },
  { name: 'Lalat', path: '/images/lalat.jpg' },
];

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedHistory = localStorage.getItem('prediction_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setActiveHistoryId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    setActiveHistoryId(null);
    const formData = new FormData();
    formData.append('file', image);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      const data: ResultData = await response.json();
      if (!response.ok) throw new Error((data as any).detail || 'Server error');

      setResult(data);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        species: data.top_prediction,
        confidence: data.predictions[0]?.prob || 0,
        timestamp: Date.now(),
        preview: preview || '',
        result: data, // simpan full result
      };

      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('prediction_history', JSON.stringify(updatedHistory));
    } catch (error: any) {
      alert(error.message || 'Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setResult(item.result);
    setPreview(item.preview);
    setImage(null);
    setActiveHistoryId(item.id);
  };

  const handleSampleImage = async (imagePath: string) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const file = new File([blob], imagePath.split('/').pop() || 'sample', { type: 'image/jpeg' });
      setImage(file);
      setPreview(imagePath);
      setResult(null);
      setActiveHistoryId(null);
    } catch (error) {
      console.error('Failed to load sample image:', error);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('prediction_history');
    setShowHistory(false);
    if (activeHistoryId) {
      setResult(null);
      setActiveHistoryId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>

      {/* Ambient glow top */}
      <div aria-hidden style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,112,243,0.4) 50%, transparent 100%)',
        zIndex: 10,
      }} />

      {/* Ambient radial */}
      <div aria-hidden style={{
        position: 'fixed',
        top: '-30vh', left: '30%',
        width: '800px', height: '800px',
        background: 'radial-gradient(circle, rgba(0,112,243,0.04) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        padding: '1.25rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #0070f3, #0055cc)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.5}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.2rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            Lens<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Arthropoda</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 8px var(--accent)',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              AI ONLINE
            </span>
          </div>

          <button
            onClick={toggleTheme}
            style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main body */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '420px 1fr',
        gap: 0,
        maxWidth: '100%',
        overflow: 'hidden',
      }}>

        {/* LEFT PANEL */}
        <aside style={{
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          height: 'calc(100vh - 65px)',
          position: 'sticky',
          top: '65px',
          overflowY: 'auto',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.6rem',
              fontWeight: 400,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              marginBottom: '0.5rem',
              letterSpacing: '-0.01em',
            }}>
              Identifikasi<br />
              <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Serangga</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Upload foto serangga untuk mendapatkan identifikasi spesies dan wawasan dari AI.
            </p>
          </div>

          {/* Drop Zone */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: preview ? 'auto' : '220px',
              minHeight: '180px',
              border: `1.5px dashed ${dragOver ? 'var(--accent)' : preview ? 'var(--border-light)' : 'var(--border)'}`,
              borderRadius: '16px',
              cursor: 'pointer',
              background: dragOver ? 'var(--accent-glow)' : preview ? 'var(--bg-elevated)' : 'var(--bg-base)',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '260px',
                  objectFit: 'contain',
                  padding: '10px',
                  borderRadius: '12px',
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div style={{
                  width: '48px', height: '48px',
                  borderRadius: '12px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: 'var(--text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Klik untuk upload</span> atau drag & drop
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>PNG, JPG, JPEG — maks 5MB</p>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>

          {preview && (
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-0.75rem' }}>
              {activeHistoryId ? 'Ini adalah foto dari history' : 'Klik gambar untuk mengganti foto'}
            </p>
          )}

          {/* File info */}
          {image && (
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'var(--accent-glow)',
                  border: '1px solid rgba(0,112,243,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: 'var(--accent)' }} strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{
                    fontSize: '0.75rem', color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {image.name}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {(image.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={analyzeImage}
            disabled={!image || loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '12px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: '0.875rem',
              letterSpacing: '0.02em',
              border: 'none',
              cursor: image && !loading ? 'pointer' : 'not-allowed',
              background: image && !loading
                ? 'linear-gradient(135deg, #0070f3 0%, #0055cc 100%)'
                : 'var(--bg-elevated)',
              color: image && !loading ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: image && !loading ? '0 4px 24px rgba(0,112,243,0.25)' : 'none',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(0,112,243,0.3)',
                  borderTopColor: 'var(--accent)',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Menganalisis...
              </>
            ) : (
              <>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Analisis Serangga
              </>
            )}
          </button>

          {/* Sample Images */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <p style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              Sample Images
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}>
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.path}
                  onClick={() => handleSampleImage(sample.path)}
                  style={{
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    aspectRatio: '1',
                    padding: 0,
                    background: 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    const elem = e.currentTarget as HTMLButtonElement;
                    elem.style.borderColor = 'var(--accent)';
                    elem.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    const elem = e.currentTarget as HTMLButtonElement;
                    elem.style.borderColor = 'var(--border)';
                    elem.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={sample.path}
                    alt={sample.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    padding: '0.5rem',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    textAlign: 'center',
                  }}>
                    {sample.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: showHistory ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                >
                  {showHistory ? '✕ Tutup History' : `History (${history.length})`}
                </button>

                {showHistory && (
                  <button
                    onClick={clearHistory}
                    title="Hapus semua history"
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)',
                      color: '#f87171',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    🗑
                  </button>
                )}
              </div>

              {showHistory && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '280px',
                  overflowY: 'auto',
                }}>
                  {history.map((item) => {
                    const isActive = activeHistoryId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleHistoryClick(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '10px',
                          background: isActive ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                          border: `1px solid ${isActive ? 'rgba(0,112,243,0.4)' : 'var(--border)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-overlay)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)';
                        }}
                      >
                        {/* Thumbnail */}
                        {item.preview ? (
                          <img
                            src={item.preview}
                            alt={item.species}
                            style={{
                              width: '38px', height: '38px',
                              borderRadius: '7px',
                              objectFit: 'cover',
                              flexShrink: 0,
                              border: '1px solid var(--border)',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '38px', height: '38px',
                            borderRadius: '7px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem',
                          }}>🪲</div>
                        )}

                        {/* Info */}
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <p style={{
                            fontSize: '0.73rem',
                            color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                            fontWeight: 500,
                            textTransform: 'capitalize',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {item.species.replace(/_/g, ' ')}
                          </p>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {(item.confidence * 100).toFixed(0)}% · {new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Arrow indicator */}
                        {isActive && (
                          <span style={{ color: 'var(--accent)', fontSize: '0.7rem', flexShrink: 0 }}>●</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <p style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.65rem',
            letterSpacing: '0.06em',
            paddingTop: '0.5rem',
            marginTop: 'auto',
          }}>
            LENSARTHROPODA &nbsp;·&nbsp; ML LAB &nbsp;·&nbsp; 2025
          </p>
        </aside>

        {/* RIGHT PANEL — Result */}
        <main style={{
          padding: '2.5rem 3rem',
          overflowY: 'auto',
          height: 'calc(100vh - 65px)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Empty state */}
          {!result && !loading && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{
                width: '80px', height: '80px',
                borderRadius: '20px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ color: 'var(--border-light)' }} strokeWidth={1}>
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Hasil identifikasi akan muncul di sini
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Upload foto serangga dan tekan Analisis, atau pilih dari History
                </p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
            }} className="animate-fade-up">
              <div style={{
                width: '48px', height: '48px',
                border: '2px solid var(--border-light)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Menganalisis gambar...
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  AI Insights mungkin membutuhkan beberapa detik
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <>
              {activeHistoryId && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  padding: '0.6rem 1rem',
                  background: 'var(--accent-glow)',
                  border: '1px solid rgba(0,112,243,0.2)',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                }}>
                  <span>Menampilkan hasil dari history · {new Date(history.find(h => h.id === activeHistoryId)?.timestamp || 0).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              <ResultCard result={result} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}