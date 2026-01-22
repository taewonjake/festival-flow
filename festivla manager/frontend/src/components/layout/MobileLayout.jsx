const MobileLayout = ({ children, header, footer }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {header && (
        <header className="bg-white shadow-sm sticky top-0 z-40">
          {header}
        </header>
      )}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      {footer && (
        <footer className="bg-white border-t border-slate-100">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default MobileLayout;
