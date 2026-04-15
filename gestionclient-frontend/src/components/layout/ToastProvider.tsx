"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1a1a45",
          color: "#E0E0FF",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          fontSize: "14px",
          backdropFilter: "blur(12px)",
        },
        success: {
          iconTheme: {
            primary: "#00E676",
            secondary: "#1a1a45",
          },
        },
        error: {
          iconTheme: {
            primary: "#FF5252",
            secondary: "#1a1a45",
          },
        },
      }}
    />
  );
}
