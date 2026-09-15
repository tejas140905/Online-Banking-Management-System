import { Link } from "react-router-dom";
import PublicPageLayout from "../components/PublicPageLayout";

const modules = [
  { title: "Customer onboarding", desc: "Registration, approval flows, and lifecycle controls in one workspace." },
  { title: "Account operations", desc: "Balances, transfers, transaction feeds, and account visibility by role." },
  { title: "Admin console", desc: "Review queues, risk actions, and platform-wide reporting for operators." },
  { title: "Reporting layer", desc: "Executive metrics, recent activity, and portfolio health at a glance." },
];

const PlatformPage = ({ auth }) => {
  return (
    <PublicPageLayout
      auth={auth}
      eyebrow="Product platform"
      title="A banking workspace designed like modern software."
      description="Credx brings onboarding, fund movement, approvals, and reporting into one product surface so teams move faster with less operational drag."
      actions={
        <>
          <Link
            to="/register"
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Start free workflow
          </Link>
          <Link
            to="/operations"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
          >
            See operations
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <article key={module.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-emerald-600">Module</div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">{module.title}</h2>
            <p className="mt-3 text-slate-500">{module.desc}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-emerald-600">Workflow</div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">From signup to transaction approval</h2>
          <div className="mt-6 grid gap-4">
            {[
              "Customers create an account and submit registration details.",
              "Admins review and approve with status controls.",
              "Users access dashboards, transfer funds, and track history.",
              "Operations teams monitor platform activity from a single console.",
            ].map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl bg-slate-100 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-slate-500">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-emerald-600">Why teams like it</div>
          <ul className="mt-6 space-y-4 text-slate-500">
            <li>Purpose-built user and admin experiences</li>
            <li>Clean routing that feels like a real product app</li>
            <li>Clear metrics blocks and operational context</li>
            <li>Fast onboarding for demos and future expansion</li>
          </ul>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default PlatformPage;
