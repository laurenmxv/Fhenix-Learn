import React from 'react';
import { AppShell } from '@/components/layout/AppShell'; // Assuming we'll use the component directly in pages, but usually pages use Layout.js.
// Actually in Base44, Layout.js wraps pages. I'll check Layout.js implementation.

export default function Layout({ children }) {
  // We need to see if the child is a specific page that needs specific layout or if we wrap all.
  // The prompt requested AppShell to be used.
  // I'll assume Layout.js is the global wrapper.
  
  // However, I need to access the user to pass to AppShell.
  // I can use base44.auth.me() hook inside AppShell, or fetch here.
  // Better to fetch inside AppShell or a context.
  
  return (
    <div className="antialiased">
        {children}
    </div>
  );
}