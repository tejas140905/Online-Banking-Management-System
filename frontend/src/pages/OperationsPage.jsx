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
      description="Apex pairs customer self-service with operator tooling so the product feels like real internal software instead of a static banking demo."
      actions={
        <>
          <Link
            to="/admin"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-surface hover:bg-sky-400"
          >
            Open admin area
          </Link>
          <Link
            to="/security"
            className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
          >
            Review security
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        {lanes.map((lane) => (
          <article key={lane.title} className="glass rounded-3xl p-6">
            <div className="text-sm text-accent">Ops lane</div>
            <h2 className="mt-3 text-xl font-semibold text-white">{lane.title}</h2>
            <p className="mt-3 text-slate-300">{lane.desc}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-3xl p-6">
          <div className="text-sm text-accent">Command center</div>
          <div className="mt-6 space-y-4">
            {[
              "Live status cards for balances, queues, and transfers",
              "Operator-first navigation through approvals and transactions",
              "Structured surfaces that are easy to extend into real dashboards",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-secondary/80 px-4 py-3 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <div className="text-sm text-accent">Designed for demos and delivery</div>
          <p className="mt-4 text-slate-300">
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
