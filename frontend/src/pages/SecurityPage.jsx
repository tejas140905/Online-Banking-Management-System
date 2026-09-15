import { Link } from "react-router-dom";
import PublicPageLayout from "../components/PublicPageLayout";

const controls = [
  "JWT-based authentication and secure session handling",
  "Role-aware route protection for users and admins",
  "Validation and middleware boundaries across API routes",
  "Transfer workflows designed for transactional integrity",
];

const SecurityPage = ({ auth }) => {
  return (
    <PublicPageLayout
      auth={auth}
      eyebrow="Security"
      title="Security posture that feels credible in a software platform."
      description="The product already speaks the language of trust: protected routes, role-based access, secure API middleware, and admin oversight built into the experience."
      actions={
        <>
          <Link
            to="/login"
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Open secure workspace
          </Link>
          <Link
            to="/platform"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
          >
            View platform
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-emerald-600">Core controls</div>
          <div className="mt-6 space-y-3">
            {controls.map((control) => (
              <div key={control} className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-500">
                {control}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-emerald-600">Trust center</div>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Review coverage</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">100% admin action visibility</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Session model</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">JWT with role-aware guards</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">API shape</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">Validated auth, account, and admin routes</div>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default SecurityPage;
