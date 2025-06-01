'use client';
import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
// Import the correct types from next-themes
import { ThemeProviderProps as NextThemeProviderProps } from 'next-themes';
interface ThemeProviderProps extends Omit<NextThemeProviderProps, 'attribute'> {
  children: React.ReactNode;
  attribute?: any; // Use any for now to fix the type error
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  [key: string]: any;
}
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
