import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#011a13" }}
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">
              Something went wrong
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              An unexpected error occurred. Try refreshing the page or returning
              to the dashboard.
            </p>
          </div>

          {this.state.message && (
            <div
              className="rounded-lg px-4 py-3 text-left text-xs font-mono break-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.4)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {this.state.message}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={this.handleReset}
              className="gap-2"
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
                background: "transparent",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>
            <Button
              onClick={() => {
                this.handleReset();
                window.location.href = "/";
              }}
              style={{ background: "#d4af37", color: "#011a13" }}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
