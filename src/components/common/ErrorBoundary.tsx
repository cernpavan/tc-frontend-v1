import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Check if this is a browser extension DOM manipulation error
    if (error.message.includes('removeChild') ||
        error.message.includes('insertBefore') ||
        error.message.includes('not a child of this node')) {
      // This is likely caused by browser extensions (translation, etc.)
      // Try to recover by forcing a re-render
      console.warn('DOM manipulation error detected - likely caused by browser extension. Attempting recovery...');
      this.setState({ hasError: false, error: null });
      window.location.reload();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/feed';
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
          <div className="card max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-900/20 rounded-full">
                <AlertTriangle className="text-red-400" size={48} />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-dark-100 mb-2">
                Something went wrong
              </h2>
              <p className="text-dark-400 text-sm">
                This might be caused by a browser extension (like translation).
                Try disabling browser translation for this site.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRefresh}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh Page
              </button>
              <button
                onClick={this.handleRetry}
                className="btn-secondary"
              >
                Go to Feed
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mt-4">
                <summary className="text-dark-500 text-sm cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 p-3 bg-dark-800 rounded-lg text-xs text-red-400 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
