import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, errorInfo: this.state.errorInfo, resetError: this.resetError });
      }
      return (
        <div className="flex items-center justify-center h-full p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
            <p className="mt-1 text-xs text-red-700">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button onClick={this.resetError} className="mt-3 text-xs font-medium text-red-800 hover:text-red-900 underline">Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
