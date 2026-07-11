import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify('https://test.supabase.co'),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify('test-anon-key'),
    'process.env.OPENAI_API_KEY': JSON.stringify('sk-test'),
    'process.env.OPENAI_BASE_URL': JSON.stringify(''),
    'process.env.OPENAI_MODEL': JSON.stringify('gpt-4o-mini'),
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
