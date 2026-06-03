import ReactMarkdown from 'react-markdown';

interface Prediction {
  class: string;
  prob: number;
}

interface ResultProps {
  result: {
    top_prediction: string;
    predictions: Prediction[];
    ai_insight: string;
  };
}

export default function ResultCard({ result }: ResultProps) {
  const topProb = result.predictions[0]?.prob ?? 0;
  const confidenceColor =
    topProb >= 0.75 ? '#0070f3' :
    topProb >= 0.5  ? '#facc15' : '#f87171';

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Top section: name + confidence side by side */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
        }} />
        <div style={{
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
        }}>
          <div>
            <p style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              Hasil Identifikasi
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.6rem, 2.5vw, 2.25rem)',
              fontWeight: 400,
              color: 'var(--text-primary)',
              textTransform: 'capitalize',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}>
              {result.top_prediction.replace(/_/g, ' ')}
            </h2>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'var(--bg-elevated)',
            border: `1px solid ${topProb >= 0.75 ? 'rgba(0,112,243,0.25)' : topProb >= 0.5 ? 'rgba(250,204,21,0.25)' : 'rgba(248,113,113,0.25)'}`,
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            minWidth: '90px',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: confidenceColor,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {(topProb * 100).toFixed(0)}%
            </span>
            <span style={{
              fontSize: '0.58rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              marginTop: '0.35rem',
              textTransform: 'uppercase',
            }}>
              Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Two column: predictions + ai insight */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
        // alignItems: 'start',
      }}>

        {/* Predictions */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <p style={{
            fontSize: '0.62rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            Top Prediksi
          </p>

          {result.predictions.map((p, idx) => (
            <div key={idx}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.3rem',
              }}>
                <span style={{
                  fontSize: '0.78rem',
                  color: idx === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: idx === 0 ? 500 : 400,
                  textTransform: 'capitalize',
                }}>
                  {idx + 1}. {p.class.replace(/_/g, ' ')}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  color: idx === 0 ? 'var(--accent)' : 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: idx === 0 ? 500 : 400,
                }}>
                  {(p.prob * 100).toFixed(1)}%
                </span>
              </div>
              {/* Bar */}
              <div style={{
                height: '4px',
                background: 'var(--bg-elevated)',
                borderRadius: '100px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${p.prob * 100}%`,
                  background: idx === 0
                    ? 'linear-gradient(90deg, #0070f3, #0055cc)'
                    : idx === 1
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(255,255,255,0.07)',
                  borderRadius: '100px',
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: '30px', height: '30px',
              background: 'var(--accent-glow)',
              border: '1px solid rgba(0,112,243,0.25)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ color: 'var(--accent)' }} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                AI Insights
              </p>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                Powered by Gemini 2.5 Flash
              </p>
            </div>
          </div>

          <div className="ai-prose">
            <ReactMarkdown>
              {result.ai_insight}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
