'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          padding: '40px',
          maxWidth: '600px',
          margin: '80px auto',
          fontFamily: 'Helvetica Neue, Arial, sans-serif',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>⚠️</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#111' }}>
            Etwas ist schiefgelaufen
          </h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
            Bitte laden Sie die Seite neu und versuchen Sie es erneut.
            Ihre Eingaben wurden gespeichert.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              background: '#1a3329', color: 'white', border: 'none',
              padding: '12px 24px', borderRadius: '8px', fontSize: '14px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Seite neu laden
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8, textAlign: 'left', fontSize: 11, overflow: 'auto' }}>
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
