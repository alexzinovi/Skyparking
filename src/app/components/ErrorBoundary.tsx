import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    alert("React Error Boundary caught error: " + error.message);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#ff0000',
          padding: '20px',
          color: '#ffffff',
          fontSize: '16px',
          fontFamily: 'monospace'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>ERROR CAUGHT BY BOUNDARY</h1>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Error:</h2>
          <p style={{ marginBottom: '20px' }}>{this.state.error?.toString()}</p>
          
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Stack:</h2>
          <pre style={{ 
            backgroundColor: '#ffffff', 
            color: '#000000', 
            padding: '15px', 
            marginBottom: '20px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {this.state.error?.stack}
          </pre>

          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Component Stack:</h2>
          <pre style={{ 
            backgroundColor: '#ffffff', 
            color: '#000000', 
            padding: '15px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {this.state.errorInfo?.componentStack}
          </pre>

          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#0000ff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
