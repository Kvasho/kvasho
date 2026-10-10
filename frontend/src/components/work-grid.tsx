import WorkCard from "@/components/work-card";

// Placeholder entries until the real works are added.
const works = Array.from({ length: 6 }, (_, i) => ({
  title: `Project ${i + 1}`,
  category: "Coming soon",
}));

export default function WorkGrid() {
  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {works.map((work, i) => (
        <WorkCard key={i} index={i + 1} {...work} />
      ))}
    </section>
  );
}
