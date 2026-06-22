import { AuthProvider } from '../context/AuthContext'

export const metadata = {
  title: 'Gamaroo',
  description: 'Math games for K-5 students',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
