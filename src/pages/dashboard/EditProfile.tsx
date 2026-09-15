import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button, Input } from "../../components/ui"
import { useAuthStore } from "../../store/auth"

export function EditProfile() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    city: user?.city || "",
    district: user?.district || "",
    pinCode: user?.pinCode || "",
    profilePhoto: user?.profilePhoto || "",
  })
  const [saved, setSaved] = useState(false)

  const update = (field: keyof typeof form, value: string) => {
    setSaved(false)
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handlePhoto = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update("profilePhoto", String(reader.result || ""))
    reader.readAsDataURL(file)
  }

  function saveChanges(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateUser(form)
    setSaved(true)
  }

  const fields = [
    ["name", t("profile.fullName", { defaultValue: "Full Name" })],
    ["email", t("profile.email", { defaultValue: "Email" })],
    ["mobile", t("profile.mobile", { defaultValue: "Mobile Number" })],
    ["city", t("profile.city", { defaultValue: "City" })],
    ["district", t("profile.district", { defaultValue: "District" })],
    ["pinCode", t("profile.pinCode", { defaultValue: "PIN Code" })],
  ] as const

  return (
    <section>
      <h1 className="text-3xl font-bold text-navy">{t("dashboard.sidebar.profile", { defaultValue: "Edit Profile" })}</h1>
      <form onSubmit={saveChanges} className="mt-6 space-y-6 rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {form.profilePhoto ? <img src={form.profilePhoto} alt={t("profile.photo", { defaultValue: "Profile Photo" })} className="h-24 w-24 rounded-full object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-navy text-3xl font-bold text-white">{(form.name || "Citizen").slice(0, 1).toUpperCase()}</div>}
          <label className="text-sm font-medium text-navy">
            {t("profile.photo", { defaultValue: "Profile Photo" })}
            <input className="mt-2 block w-full text-sm" type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files?.[0])} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([field, label]) => (
            <label key={field} className="text-sm font-medium text-navy">
              {label}
              <Input className="mt-2" value={form[field]} onChange={(event) => update(field, event.target.value)} type={field === "email" ? "email" : "text"} />
            </label>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary">{t("profile.save", { defaultValue: "Save Changes" })}</Button>
          {saved && <span className="text-sm text-green-700">{t("profile.saved", { defaultValue: "Profile updated successfully" })}</span>}
        </div>
      </form>
    </section>
  )
}

export default EditProfile
