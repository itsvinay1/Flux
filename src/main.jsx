import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('[FLUX Error Boundary] Caught unhandled render exception:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0d0d1a',
          color: '#fff', textAlign: 'center', padding: '24px', fontFamily: 'sans-serif',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Something went wrong ⚡</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>FLUX encountered an unexpected render issue.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px', borderRadius: '16px', background: '#0ea5e9',
              color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
