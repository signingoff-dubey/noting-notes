import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    alert('Error: ' + (error?.message || error))
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error)
      ) : (
        <div className="flex items-center justify-center h-full w-full p-8">
          <div className="text-center">
            <h2 className="text-xl font-mono mb-2" style={{ color: 'var(--color-error)' }}>
              Something went wrong
            </h2>
            <p className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 font-mono text-sm"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}