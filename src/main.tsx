import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { getRouter } from './router'
import './styles.css'
import './index.css'

const queryClient = new QueryClient()
const router = getRouter()

// Thay thế chuỗi bên dưới bằng Client ID thực tế bạn đã copy từ Google Cloud Console
const GOOGLE_CLIENT_ID = "322476659279-iopih719c8lg427bk3386amcq61cudae.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
// cd C:\Users\Admin\WebStudy\studia-frontend
// C:\Users\Admin\.bun\bin\bun.exe dev