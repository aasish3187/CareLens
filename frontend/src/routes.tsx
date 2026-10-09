import { createBrowserRouter } from 'react-router'
import AppShell from './components/layout/AppShell'
import Overview from './pages/Overview'
import BodyTwinPage from './pages/BodyTwinPage'
import Upload from './pages/Upload'
import EvidenceStudio from './pages/EvidenceStudio'
import Medications from './pages/Medications'
import Timeline from './pages/Timeline'
import AbhaCard from './pages/AbhaCard'
import Multilingual from './pages/Multilingual'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: Overview },
      { path: 'body-twin', Component: BodyTwinPage },
      { path: 'twin', Component: BodyTwinPage },
      { path: 'upload', Component: Upload },
      { path: 'evidence/:docId?', Component: EvidenceStudio },
      { path: 'medications', Component: Medications },
      { path: 'timeline', Component: Timeline },
      { path: 'abha', Component: AbhaCard },
      { path: 'multilingual', Component: Multilingual },
      { path: '*', Component: NotFound },
    ],
  },
])
