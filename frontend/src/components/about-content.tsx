import Image from "next/image";
import type { ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";

// Placeholder CV until the real one is written; the texts live in the dictionaries.
const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "PHP",
  "Laravel",
  "Node.js",
  "PostgreSQL",
  "MySQL",
  "Tailwind CSS",
  "GSAP",
  "Docker",
  "Git",
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section data-reveal className="border-t border-foreground/10 pt-8">
      <h3 className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function AboutContent({ t }: { t: Dictionary["about"] }) {
  const contacts = [
    { label: t.contacts.email, value: "hello@example.com" },
    { label: t.contacts.phone, value: "+995 555 00 00 00" },
    { label: t.contacts.location, value: t.contacts.locationValue },
  ];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[2fr_3fr] lg:gap-20">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div
          data-reveal
          className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-foreground/10"
        >
          <Image
            src="/about.jpg"
            alt={t.imageAlt}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-accent/40 via-transparent to-transparent mix-blend-multiply" />
        </div>

        <dl data-reveal className="mt-8 space-y-3 text-sm">
          {contacts.map((contact) => (
            <div key={contact.label} className="flex justify-between gap-6">
              <dt className="uppercase tracking-[0.2em] text-foreground/50">
                {contact.label}
              </dt>
              <dd>{contact.value}</dd>
            </div>
          ))}
        </dl>
      </aside>

      <div className="space-y-12">
        <header data-reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            {t.kicker}
          </p>
          <h2 className="mt-3 font-display text-7xl uppercase leading-none sm:text-9xl">
            Kvasho
          </h2>
          <p className="mt-4 text-xl text-foreground/70">{t.role}</p>
        </header>

        <Section title={t.sections.profile}>
          <p className="max-w-2xl text-lg leading-8 text-foreground/80">
            {t.profile}
          </p>
        </Section>

        <Section title={t.sections.experience}>
          <ol className="space-y-8">
            {t.experience.map((job) => (
              <li
                key={job.company}
                className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <p className="text-sm text-foreground/50">{job.period}</p>
                <div>
                  <h4 className="text-lg font-medium">{job.role}</h4>
                  <p className="text-sm text-accent">{job.company}</p>
                  <p className="mt-3 leading-7 text-foreground/70">
                    {job.summary}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title={t.sections.skills}>
          <ul className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                {skill}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t.sections.education}>
          <ol className="space-y-6">
            {t.education.map((item) => (
              <li
                key={item.title}
                className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-6"
              >
                <p className="text-sm text-foreground/50">{item.period}</p>
                <div>
                  <h4 className="text-lg font-medium">{item.title}</h4>
                  <p className="text-sm text-foreground/70">{item.place}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title={t.sections.languages}>
          <ul className="grid gap-4 sm:grid-cols-3">
            {t.languages.map((language) => (
              <li key={language.name}>
                <p className="text-lg font-medium">{language.name}</p>
                <p className="text-sm text-foreground/50">{language.level}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
