import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-slate-900 to-slate-800 p-4">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-16 h-16">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Analisando sua caixa de entrada...
          </h2>
          <p className="text-slate-400">Isso pode levar alguns segundos</p>
          <div className="mt-4 flex justify-center gap-1">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
