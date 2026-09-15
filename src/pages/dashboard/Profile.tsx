import { useTranslation } from "react-i18next"
import { useAuthStore } from "../../store/auth"

export function Profile() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const profile = [
    [t("profile.fullName", { defaultValue: "Full Name" }), user?.name || "Citizen"],
    [t("profile.email", { defaultValue: "Email" }), user?.email || "—"],
    [t("profile.mobile", { defaultValue: "Mobile Number" }), user?.mobile || "—"],
    [t("profile.city", { defaultValue: "City" }), user?.city || "—"],
    [t("profile.district", { defaultValue: "District" }), user?.district || "—"],
    [t("profile.pinCode", { defaultValue: "PIN Code" }), user?.pinCode || "—"],
  ]

  return (
    <section>
      <h1 className="text-3xl font-bold text-navy">{t("profile.title", { defaultValue: "Profile" })}</h1>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={t("profile.photo", { defaultValue: "Profile Photo" })} className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-navy text-3xl font-bold text-white" aria-label={t("profile.photo", { defaultValue: "Profile Photo" })}>
              {(user?.name || "Citizen").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            {profile.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
