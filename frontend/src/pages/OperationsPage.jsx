import { Link } from "react-router-dom";
import PublicPageLayout from "../components/PublicPageLayout";

const lanes = [
  {
    title: "Approvals queue",
    desc: "Triage pending users, activate accounts, and keep onboarding moving without losing control.",
  },
  {
    title: "Account oversight",
    desc: "Track balances and account health across the full platform from one admin surface.",
  },
  {
    title: "Transaction monitoring",
    desc: "Review movement history, monitor activity, and support customer operations faster.",
  },
];

const OperationsPage = ({ auth }) => {
  return (
    <PublicPageLayout
      auth={auth}
      eyebrow="Operations"
      title="Built for the people who run the bank, not only the customers."
      description="Credx pairs customer self-service with operator tooling so the product feels like real internal software instead of a static banking demo."
      actions={
        <>
          <Link
            to="/admin"
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-emerald-500"
          >
            Open admin area
          </Link>
          <Link
            to="/security"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
          >
            Review security
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        {lanes.map((lane) => (
          <article key={lane.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-emerald-600">Ops lane</div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{lane.title}</h2>
            <p className="mt-3 text-slate-500">{lane.desc}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-emerald-600">Command center</div>
          <div className="mt-6 space-y-4">
            {[
              "Live status cards for balances, queues, and transfers",
              "Operator-first navigation through approvals and transactions",
              "Structured surfaces that are easy to extend into real dashboards",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-500">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-emerald-600">Designed for demos and delivery</div>
          <p className="mt-4 text-slate-500">
            These pages frame the project like a software product with modules, trust signals,
            and operational workflows. That gives you something that looks more intentional in a
            preview, portfolio, or client demo.
          </p>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default OperationsPage;
