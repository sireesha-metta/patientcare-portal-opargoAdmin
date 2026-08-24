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

export default function PracticeManagement() {
  return (
    <ComingSoon
      title="Practice Management"
      next="practice list, add practice, XML upload, logo, and practice admin/manager modals."
    />
  );
}
