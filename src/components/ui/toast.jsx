"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

// Global toast emitter
const listeners = new Set();

export function toast(options) {
  const id = Date.now() + Math.random().toString(36).substring(2, 5);
  let toastItem;
  if (typeof options === "string") {
    toastItem = { id, title: options, description: "", type: "info" };
  } else {
    toastItem = { id, title: options.title || "", description: options.description || "", type: options.type || "info" };
  }
  listeners.forEach((listener) => listener(toastItem, options.duration || 3500));
}

toast.success = (title, description = "") => {
  const id = Date.now() + Math.random().toString(36).substring(2, 5);
  const toastItem = { id, title, description, type: "success" };
  listeners.forEach((listener) => listener(toastItem, 3500));
};

toast.error = (title, description = "") => {
  const id = Date.now() + Math.random().toString(36).substring(2, 5);
  const toastItem = { id, title, description, type: "error" };
  listeners.forEach((listener) => listener(toastItem, 4000));
};

toast.info = (title, description = "") => {
  const id = Date.now() + Math.random().toString(36).substring(2, 5);
  const toastItem = { id, title, description, type: "info" };
  listeners.forEach((listener) => listener(toastItem, 3500));
};

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (newToast, duration) => {
      setToasts((prev) => [...prev, newToast]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, duration);
      }
    };

    listeners.add(handleToast);
    return () => listeners.delete(handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-5 ${
            t.type === "success"
              ? "bg-zinc-900 border-emerald-500/30 text-emerald-400"
              : t.type === "error"
              ? "bg-zinc-900 border-red-500/30 text-red-400"
              : "bg-zinc-900 border-blue-500/30 text-blue-400"
          }`}
        >
          {t.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />}
          {t.type === "error" && <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />}
          {t.type === "info" && <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white">{t.title}</div>
            {t.description && (
              <div className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{t.description}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-zinc-500 hover:text-zinc-300 p-1 -mr-1 -mt-1 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  return { toast };
}
