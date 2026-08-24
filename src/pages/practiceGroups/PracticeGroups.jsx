function ComingSoon({ title, next }) {
  return (
    <div className="rounded-lg bg-white p-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 text-sm text-slate-600">
        This page is wired in the Opargo Admin MFE. The Angular behavior will be
        ported next: {next}
      </p>
    </div>
  );
}

export default function PracticeGroups() {
  return (
    <ComingSoon
      title="Practice Groups"
      next="group list, create group, add site, and remove site."
    />
  );
}
