import { useState, useEffect } from 'react'
import { X, User, Phone, Heart, AlertCircle, Save, CheckCircle2, Users, Plus, ShieldCheck, Sparkles } from 'lucide-react'

export interface PatientProfile {
  id: string
  name: string
  abhaNumber: string
  abhaAddress: string
  age: number
  gender: string
  bloodGroup: string
  phone: string
  email: string
  emergencyContact: string
  conditions: string[]
  allergies: string[]
  physician: string
}

const DEFAULT_PROFILES: PatientProfile[] = [
  {
    id: 'p1',
    name: 'Arjun Verma',
    abhaNumber: 'MOCK-91-8273-9182-1928',
    abhaAddress: 'arjun.verma@abdm',
    age: 42,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98765 43210',
    email: 'arjun.verma@example.com',
    emergencyContact: 'Meera Verma (Spouse) · +91 98765 43211',
    conditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension'],
    allergies: ['Penicillin (Rash)'],
    physician: 'Dr. K. S. Rao, MD (Apollo Hospital)',
  },
  {
    id: 'p2',
    name: 'Meera Verma',
    abhaNumber: 'MOCK-91-3829-1920-8472',
    abhaAddress: 'meera.verma@abdm',
    age: 39,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 98765 43211',
    email: 'meera.verma@example.com',
    emergencyContact: 'Arjun Verma (Spouse) · +91 98765 43210',
    conditions: ['Mild Hypothyroidism'],
    allergies: ['None reported'],
    physician: 'Dr. Ananya Sen, MD (Care Hospital)',
  },
  {
    id: 'p3',
    name: 'Ramesh Verma',
    abhaNumber: 'MOCK-91-5612-9012-3481',
    abhaAddress: 'ramesh.verma@abdm',
    age: 68,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98765 43215',
    email: 'ramesh.verma@example.com',
    emergencyContact: 'Arjun Verma (Son) · +91 98765 43210',
    conditions: ['Coronary Artery Disease', 'Osteoarthritis'],
    allergies: ['Sulfa drugs'],
    physician: 'Dr. V. Prasad, DM Cardiology',
  },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function PatientProfileModal({ isOpen, onClose }: Props) {
  const [profiles, setProfiles] = useState<PatientProfile[]>(() => {
    try {
      const stored = localStorage.getItem('carelens_patient_profiles')
      if (stored) return JSON.parse(stored)
    } catch {}
    return DEFAULT_PROFILES
  })

  const [activeId, setActiveId] = useState<string>(() => {
    try {
      return localStorage.getItem('carelens_active_patient_id') || 'p1'
    } catch {
      return 'p1'
    }
  })

  const [activeProfile, setActiveProfile] = useState<PatientProfile>(() => {
    const p = profiles.find((item) => item.id === activeId) || profiles[0]
    return { ...p }
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<PatientProfile>({ ...activeProfile })
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)

  useEffect(() => {
    const current = profiles.find((p) => p.id === activeId) || profiles[0]
    setActiveProfile({ ...current })
    setFormData({ ...current })
  }, [activeId, profiles])

  if (!isOpen) return null

  const handleSave = () => {
    let updatedProfiles = profiles.map((p) => (p.id === formData.id ? { ...formData } : p))
    if (isAddingNew) {
      updatedProfiles = [...profiles, formData]
      setIsAddingNew(false)
    }
    setProfiles(updatedProfiles)
    setActiveId(formData.id)
    setActiveProfile({ ...formData })
    setIsEditing(false)
    setSavedSuccess(true)

    try {
      localStorage.setItem('carelens_patient_profiles', JSON.stringify(updatedProfiles))
      localStorage.setItem('carelens_active_patient_id', formData.id)
      window.dispatchEvent(new CustomEvent('carelens_patient_updated', { detail: formData }))
    } catch {}

    setTimeout(() => setSavedSuccess(false), 2400)
  }

  const handleSwitchProfile = (p: PatientProfile) => {
    setActiveId(p.id)
    setActiveProfile({ ...p })
    setFormData({ ...p })
    setIsEditing(false)
    setIsAddingNew(false)
    try {
      localStorage.setItem('carelens_active_patient_id', p.id)
      window.dispatchEvent(new CustomEvent('carelens_patient_updated', { detail: p }))
    } catch {}
  }

  const handleAddNewClick = () => {
    const newId = `p_${Date.now()}`
    const newP: PatientProfile = {
      id: newId,
      name: 'New Patient',
      abhaNumber: `MOCK-91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      abhaAddress: 'new.patient@abdm',
      age: 30,
      gender: 'Other',
      bloodGroup: 'O+',
      phone: '+91 ',
      email: '',
      emergencyContact: '',
      conditions: [],
      allergies: [],
      physician: '',
    }
    setFormData(newP)
    setIsAddingNew(true)
    setIsEditing(true)
  }

  const initials = (formData.name || 'AV')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-teal-tint via-white to-cyan-tint px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-teal to-cyan text-sm font-bold text-white shadow-md shadow-teal/30">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-heading">{formData.name}</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  <ShieldCheck className="size-3" />
                  MOCK ABHA Verified
                </span>
              </div>
              <p className="font-mono text-xs text-muted">{formData.abhaNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-heading"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Profile Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-line bg-subtle/50 px-6 py-2.5">
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
            <Users className="size-3.5" />
            Profiles:
          </span>
          {profiles.map((p) => {
            const isSelected = p.id === activeId && !isAddingNew
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSwitchProfile(p)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-teal text-white shadow-sm ring-1 ring-teal'
                    : 'bg-white text-body ring-1 ring-line hover:bg-subtle hover:text-heading'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] opacity-80">({p.age}y)</span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={handleAddNewClick}
            className="flex items-center gap-1 rounded-full border border-dashed border-teal/40 bg-white px-2.5 py-1 text-xs font-semibold text-teal hover:bg-teal-tint"
          >
            <Plus className="size-3" />
            Add Profile
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 animate-in fade-in">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Patient profile updated and synced across all modules!
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Patient Details & Health Profile</p>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-lg bg-subtle px-3 py-1.5 text-xs font-semibold text-heading ring-1 ring-line hover:bg-slate-200"
              >
                Edit Information
              </button>
            ) : (
              <span className="text-xs font-semibold text-teal">Editing Profile...</span>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted">ABHA Address</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.abhaAddress}
                onChange={(e) => setFormData({ ...formData, abhaAddress: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-mono text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted">Age</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted">Gender</label>
                <select
                  disabled={!isEditing}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-2 text-sm text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted">Blood Group</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-2 text-sm text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted">Primary Phone</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted">Email Address</label>
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted">Emergency Contact</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted">Chronic Medical Conditions</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.conditions.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    conditions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted">Known Allergies</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.allergies.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g. Penicillin, Sulfa"
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-heading disabled:bg-subtle/50 focus:border-teal focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-subtle/50 px-6 py-4">
          <p className="text-xs text-muted">ABDM NRCeS Synthetic Records · Patient Data Stored Locally</p>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({ ...activeProfile })
                  setIsAddingNew(false)
                }}
                className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-body hover:bg-subtle"
              >
                Cancel
              </button>
            )}
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-hover"
              >
                <Save className="size-3.5" />
                Save Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-teal px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-hover"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
