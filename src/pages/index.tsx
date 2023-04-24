import UnauthenticatedPage from '@/components/layouts/unauthenticated-page'
import LoginPage from '@/components/unauthenticated/login-page'

export default function Index() {
  return (
    <UnauthenticatedPage>
      <LoginPage></LoginPage>
    </UnauthenticatedPage>
  )
}
