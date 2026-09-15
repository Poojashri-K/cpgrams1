import { useTranslation } from "react-i18next"

function WebsitePolicies() {
  return (
    <div className="max-w-3xl space-y-8 text-muted-foreground leading-relaxed">
      <p className="text-sm text-muted-foreground/80">
        Centralized Public Grievance Redress And Monitoring System (CPGRAMS) &mdash; Website Policies
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-navy">Copyright Policy</h2>
        <p>
          Material featured on this Website may be reproduced free of charge.
          However, the material has to be reproduced accurately and not to be
          used in a derogatory manner or in a misleading context. Wherever the
          material is being published or issued to others, the source must be
          prominently acknowledged. However, the permission to reproduce this
          material shall not extend to any material which is identified as
          being copyright of a third party. Authorization to reproduce such
          material must be obtained from the departments/copyright holders
          concerned.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-navy">
          Hyperlinking Policy
        </h2>

        <div className="space-y-2">
          <h3 className="font-semibold text-navy/90">
            Links to external Websites/portals
          </h3>
          <p>
            At many places in this Website, you shall find links to other
            Websites/Portal/Web Application/Mobile applications. These links
            have been placed for your convenience. Department of Administrative
            Reforms &amp; Public Grievances is not responsible for the contents
            of the linked destinations and does not necessarily endorse the
            views expressed in them. Mere presence of the link or its listing
            on this Website should not be assumed as endorsement of any kind.
            We cannot guarantee that these links will work all the time and we
            have no control over availability of linked destinations.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-navy/90">
            Links to our Website by other Websites/Portals
          </h3>
          <p>
            We do not object to you linking directly to the information that is
            hosted on this Website and no prior permission is required for the
            same. However, we would like you to inform us about any links
            provided to this Website so that you can be informed of any changes
            or updates therein. Also, we do not permit our pages to be loaded
            into frames on your site. The pages belonging to this Website must
            load into a newly opened browser window of the User.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-navy">Privacy Policy</h2>

        <p>
          Department of Administrative Reforms &amp; Public Grievances does
          not automatically capture any specific personal information from you
          (like name, phone number or e-mail address), that allows us to
          identify you individually. If you choose to provide us with your
          personal information, like names or addresses, when you visit our
          Website, we use it only to fulfill your request for information.
        </p>

        <p>
          We do not sell or share any personally identifiable information
          volunteered on this site to any third party (public/private). Any
          information provided to this Website will be protected from loss,
          misuse, unauthorized access or disclosure, alteration, or destruction.
        </p>

        <p>
          We gather certain information about the User, such as Internet
          protocol (IP) address, domain name, browser type, operating system,
          the date and time of the visit and the pages visited. We make no
          attempt to link these addresses with the identity of individuals
          visiting our site unless an attempt to damage the site has been
          detected.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-navy">
          Terms &amp; Conditions
        </h2>

        <p>
          This Website is designed, developed and maintained by Department of
          Administrative Reforms &amp; Public Grievances, Government of India.
        </p>

        <p>
          Though all efforts have been made to ensure the accuracy and currency
          of the content on this Website, the same should not be construed as a
          statement of law or used for any legal purposes. In case of any
          ambiguity or doubts, users are advised to verify/check with the
          Department&apos;s and/or other source(s), and to obtain appropriate
          professional advice.
        </p>

        <p>
          Under no circumstances will this Department be liable for any
          expense, loss or damage including, without limitation, indirect or
          consequential loss or damage, or any expense, loss or damage
          whatsoever arising from use, or loss of use, of data, arising out of
          or in connection with the use of this Website.
        </p>

        <p>
          The information posted on this Website could include hypertext links
          or pointers to information created and maintained by non-Government /
          private organization. Department of Administrative Reforms &amp;
          Public Grievances is providing these links and pointers solely for
          your information and convenience. When you select a link to an
          external Website, you are leaving the Department of Administrative
          Reforms &amp; Public Grievances Website and are subject to the privacy
          and security policies of the owners/sponsors of the external Website.
        </p>

        <p>
          Department of Administrative Reforms &amp; Public Grievances does not
          guarantee availability of linked pages at all times.
        </p>

        <p>
          Department of Administrative Reforms &amp; Public Grievances cannot
          authorize use of copyrighted materials contained in linked Website.
          Users are advised to request such authorization from owners of linked
          Websites.
        </p>

        <p>
          Department of Administrative Reforms &amp; Public Grievances does not
          guarantee that linked Websites comply with Indian Government Web
          Guidelines.
        </p>
      </section>
    </div>
  )
}

export function SectionPage({ type }: { type: "appeal" | "terms" }) {
  const { t } = useTranslation()

  const title =
    type === "appeal"
      ? t("dashboard.sidebar.appeal")
      : t("dashboard.sidebar.terms")

  const description =
    type === "appeal"
      ? "Submit and track an appeal."
      : "Read the CPGRAMS terms and conditions."

  if (type === "terms") {
    return (
      <section>
        <h1 className="text-3xl font-bold text-navy">{title}</h1>

        <p className="mt-3 text-muted-foreground">{description}</p>

        <div className="mt-8">
          <WebsitePolicies />
        </div>
      </section>
    )
  }

  return (
    <section>
      <h1 className="text-3xl font-bold text-navy">{title}</h1>

      <p className="mt-3 text-muted-foreground">
        {t(`dashboard.${type}Description`, description)}
      </p>
    </section>
  )
}