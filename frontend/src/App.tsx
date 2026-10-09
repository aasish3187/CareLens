import { RouterProvider } from 'react-router'
import { I18nProvider } from './i18n/I18nContext'
import { router } from './routes'

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  )
}
