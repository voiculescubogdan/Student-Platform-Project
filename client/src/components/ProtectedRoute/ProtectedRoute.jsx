import { AuthGuard } from "../AuthGuard/AuthGuard"
import AuthLayout from '../AuthLayout/AuthLayout'

export function ProtectedRoute({ children }) {
  return (
    <AuthGuard>
      <AuthLayout>
        {children}
      </AuthLayout>
    </AuthGuard>
  )
}