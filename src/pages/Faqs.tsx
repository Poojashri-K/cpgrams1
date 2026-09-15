import { useTranslation } from "react-i18next"

const faqs = [
  {
    q: "What is CPGRAMS?",
    a: "CPGRAMS (Centralized Public Grievance Redress and Monitoring System) is an online platform that lets citizens lodge grievances against public authorities on any service-delivery matter. It is available 24x7 and routes each complaint to the concerned Ministry, Department, or State for redress.",
  },
  {
    q: "Who can file a grievance on this portal?",
    a: "Any citizen can file a grievance. You need to register with a valid name, email address, and mobile number so the concerned authority can verify the complaint and share updates with you.",
  },
  {
    q: "How do I file a new grievance?",
    a: "Log in to your account, open 'File Grievance', accept the terms, select the concerned department and jurisdiction, describe your issue clearly, attach any supporting documents, and submit. You will receive a unique registration number for tracking.",
  },
  {
    q: "How can I track the status of my grievance?",
    a: "Use the 'Check Status' page and enter your registration number along with your registered email, or open 'My Grievances' after logging in to see the current stage and latest updates for every complaint you have submitted.",
  },
  {
    q: "How long does it take to resolve a grievance?",
    a: "Most grievances are addressed within 30 days. Cases that are complex or involve multiple departments may take longer, and you will be notified whenever there is a delay or a request for additional information.",
  },
  {
    q: "What documents can I attach to support my grievance?",
    a: "You can attach relevant supporting files such as application copies, receipts, previous correspondence, or photographs. Uploading clear documents helps the concerned authority understand and resolve your issue faster.",
  },
  {
    q: "What is an appeal and when should I file one?",
    a: "If you are not satisfied with the resolution of a closed grievance, you can file an appeal so that a higher authority reviews the case again. Open the 'Appeal' section, select the closed grievance, and explain why you are dissatisfied.",
  },
  {
    q: "Can I file a grievance anonymously?",
    a: "No. To ensure accountability and allow the authority to follow up and share the resolution, every grievance must be filed from a registered account with valid contact details.",
  },
  {
    q: "How do I update my profile or change my password?",
    a: "Go to the dashboard and open 'Profile' to update your personal details, or open 'Change Password' to set a new password. Keeping your contact information current ensures you receive all grievance notifications.",
  },
  {
    q: "What types of matters are not taken up under CPGRAMS?",
    a: "Grievances that are sub judice, related to religious matters, RTI requests, or personal and family disputes are generally not addressed through CPGRAMS. Such cases should be pursued through the appropriate legal or designated channels.",
  },
]

export function Faqs({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation()
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{t("faq.title")}</h1>
      <p className="mt-2 text-muted-foreground">
        Answers to common questions about using the CPGRAMS grievance portal.
      </p>
      <div className="mt-8 space-y-4">
        {faqs.map((item) => (
          <details className="rounded-lg border bg-card p-5" key={item.q}>
            <summary className="cursor-pointer font-semibold">{item.q}</summary>
            <p className="mt-3 text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
export default Faqs
