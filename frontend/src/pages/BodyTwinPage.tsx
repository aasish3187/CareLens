import { useState } from 'react'
import { useT } from '../i18n/I18nContext'
import { organs } from '../data/organs'
import Card from '../components/ui/Card'
import PageHeader from '../components/PageHeader'
import BodyTwin from '../components/BodyTwin'
import BodyTwin3D from '../components/BodyTwin3D'
import OrganPanel from '../components/OrganPanel'
import { statusStyles, type HealthStatus } from '../components/ui/StatusPill'
import SafetyBadge from '../components/ui/SafetyBadge'
import { usePatientData } from '../hooks/usePatientData'
import { Box, MapPin } from 'lucide-react'

// Map 3D organ keys to backend organ system names
const organToSystemMap: Record<string, string> = {
  pancreas: 'endocrine',
  heart: 'cardiovascular',
  lungs: 'respiratory',
  kidneys: 'renal',
  liver: 'hepatic',
  brain: 'neurological',
  knee: 'musculoskeletal',
}

export default function BodyTwinPage() {
  const t = useT()
  const [organ, setOrgan] = useState('pancreas')
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d')
  const { data } = usePatientData()

  // Calculate live organ statuses from backend observations
  const liveOrganStatuses: Record<string, HealthStatus> = {}
  organs.forEach((o) => {
    const sysKey = organToSystemMap[o.id]
    if (sysKey && data.organ_systems[sysKey]) {
      liveOrganStatuses[o.id] = data.organ_systems[sysKey].status
    } else {
      liveOrganStatuses[o.id] = o.status
    }
  })

  return (
    <div>
      <PageHeader
        title={t('twin.title')}
        subtitle={t('twin.subtitle')}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg bg-subtle p-1 ring-1 ring-line">
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === '3d' ? 'bg-teal text-white shadow-sm' : 'text-muted hover:text-heading'
                }`}
              >
                <Box className="size-3.5" />
                3D Hologram Twin
              </button>
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === '2d' ? 'bg-teal text-white shadow-sm' : 'text-muted hover:text-heading'
                }`}
              >
                <MapPin className="size-3.5" />
                2D Anatomical Map
              </button>
            </div>
            <SafetyBadge kind="grounded" />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card className="relative overflow-hidden p-0 border border-line shadow-sm">
          <div className="h-[510px] w-full">
            {viewMode === '3d' ? (
              <BodyTwin3D selected={organ} onSelect={setOrgan} organStatuses={liveOrganStatuses} />
            ) : (
              <div className="relative mx-auto h-full max-w-md py-6">
                <BodyTwin selected={organ} onSelect={setOrgan} />
              </div>
            )}
          </div>

          <div className="border-t border-line bg-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t('twin.organs')}</p>
            <div className="flex flex-wrap gap-2">
              {organs.map((o) => {
                const currentStatus = liveOrganStatuses[o.id] || o.status
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOrgan(o.id)}
                    aria-pressed={organ === o.id}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors ${
                      organ === o.id ? 'bg-teal text-white ring-teal' : 'bg-white text-body ring-line hover:bg-subtle'
                    }`}
                  >
                    <span
                      className="size-2 rounded-full ring-2 ring-white/70"
                      style={{ background: statusStyles[currentStatus]?.hex || '#0EA5E9' }}
                      aria-hidden
                    />
                    {t(`organ.${o.id}`)}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:sticky lg:top-24 lg:self-start">
          <OrganPanel organId={organ} />
        </Card>
      </div>
    </div>
  )
}
