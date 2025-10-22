import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              ⚠️ Something went wrong
            </h1>
            <p className="text-gray-300 mb-4">
              The application encountered an error. Please refresh the page to try again.
            </p>
            
            {this.state.error && (
              <div className="bg-gray-800 rounded p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">Error:</p>
                <p className="text-red-400 font-mono text-sm">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-md transition"
              >
                Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Show error details
                </summary>
                <pre className="mt-2 bg-gray-800 rounded p-4 text-xs text-gray-400 overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
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

export default ErrorBoundary;
