import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background: #fef2f2;
  border-radius: 1rem;
  margin: 2rem;
`;

const ErrorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background: #fee2e2;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  color: #dc2626;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #991b1b;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: #7f1d1d;
  font-size: 1.125rem;
  margin-bottom: 2rem;
  max-width: 500px;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ErrorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: #dc2626;
    color: white;
    
    &:hover {
      background: #b91c1c;
    }
  }
  
  &.secondary {
    background: white;
    color: #991b1b;
    border: 2px solid #fecaca;
    
    &:hover {
      background: #fef2f2;
    }
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>
            <AlertTriangle size={40} />
          </ErrorIcon>
          
          <ErrorTitle>Something went wrong</ErrorTitle>
          
          <ErrorMessage>
            We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
          </ErrorMessage>
          
          <ErrorActions>
            <ErrorButton className="primary" onClick={this.handleReload}>
              <RefreshCw size={20} />
              Reload Page
            </ErrorButton>
            
            <ErrorButton className="secondary" onClick={this.handleGoHome}>
              <Home size={20} />
              Go Home
            </ErrorButton>
          </ErrorActions>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: '#fff', 
              borderRadius: '0.5rem',
              maxWidth: '100%',
              overflow: 'auto'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                fontSize: '0.875rem', 
                color: '#374151',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
