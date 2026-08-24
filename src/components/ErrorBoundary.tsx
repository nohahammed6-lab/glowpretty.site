import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  isArabic?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log privately to developer console only; never render raw code or stack traces to the visitor
    console.error('Application caught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      const isAr = this.props.isArabic !== false;
      return (
        <div
          className="min-h-screen bg-[#1a000a] text-white flex flex-col items-center justify-center p-6 select-none"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="max-w-md w-full text-center flex flex-col items-center bg-[#2a0011]/80 border border-[#D4AF37]/30 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 rounded-full border border-[#D4AF37]/40 bg-[#3f0018] flex items-center justify-center mb-6 shadow-lg shadow-[#D4AF37]/10">
              <span className="material-symbols-outlined text-3xl text-[#D4AF37]">
                spa
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-[#D4AF37] font-serif mb-3">
              {isAr ? 'صالون غلو بريتي للتجميل' : 'GLOW PRETTY Beauty Salon'}
            </h1>

            <p className="text-sm text-pink-100/80 mb-6 leading-relaxed">
              {isAr
                ? 'نعتذر، حدث انقطاع مؤقت في الاتصال. يرجى إعادة المحاولة لعرض أحدث الخدمات.'
                : 'Unable to load content. Please try again to refresh the latest services.'}
            </p>

            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#c49f2f] text-[#2a0011] font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              <span>{isAr ? 'إعادة المحاولة الآن' : 'Try Again'}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
