'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectContent() {
  const searchParams = useSearchParams();
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      setTargetUrl(url);
      const rabbyUri = `rabby://dapp?url=${encodeURIComponent(url)}`;
      
      // Attempt immediate redirection to Rabby Wallet
      window.location.href = rabbyUri;
      
      // Fallback redirect after 1.5 seconds if they are not redirected automatically
      const timer = setTimeout(() => {
        window.location.href = rabbyUri;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!targetUrl) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-sm text-slate-400">Geçersiz Yönlendirme Linki / Invalid Redirect Link</div>
      </div>
    );
  }

  const rabbyUri = `rabby://dapp?url=${encodeURIComponent(targetUrl)}`;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans p-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-sm w-full p-8 rounded-2xl border border-slate-900 bg-slate-950/80 backdrop-blur-md shadow-2xl flex flex-col items-center gap-6">
        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-400 rounded-full animate-spin" />
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>

        <h1 className="text-lg font-bold text-white">Rabby Wallet'a Yönlendiriliyorsunuz</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Eğer cüzdanınız otomatik olarak açılmazsa aşağıdaki butona tıklayabilirsiniz.
        </p>

        <a
          href={rabbyUri}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-750 font-semibold text-sm transition-all shadow-lg shadow-indigo-900/40 text-white cursor-pointer"
        >
          Rabby Wallet'ı Aç / Open Rabby
        </a>

        <div className="text-[10px] text-slate-500 font-mono break-all mt-4 border-t border-slate-900/60 pt-4 w-full">
          Hedef / Target: {targetUrl}
        </div>
      </div>
    </main>
  );
}

export default function RabbyRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-sm text-slate-400">Yükleniyor / Loading...</div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}
