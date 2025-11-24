export default function SectionBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-6 bg-white border shadow rounded-2xl mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </section>
  );
}
