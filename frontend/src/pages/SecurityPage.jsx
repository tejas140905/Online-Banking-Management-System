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
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-surface hover:bg-sky-400"
          >
            Open secure workspace
          </Link>
          <Link
            to="/platform"
            className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
          >
            View platform
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <div className="text-sm text-accent">Core controls</div>
          <div className="mt-6 space-y-3">
            {controls.map((control) => (
              <div key={control} className="rounded-2xl bg-secondary/80 px-4 py-3 text-slate-300">
                {control}
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <div className="text-sm text-accent">Trust center</div>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-secondary p-4">
              <div className="text-xs text-muted">Review coverage</div>
              <div className="mt-2 text-2xl font-semibold text-white">100% admin action visibility</div>
            </div>
            <div className="rounded-2xl bg-secondary p-4">
              <div className="text-xs text-muted">Session model</div>
              <div className="mt-2 text-2xl font-semibold text-white">JWT with role-aware guards</div>
            </div>
            <div className="rounded-2xl bg-secondary p-4">
              <div className="text-xs text-muted">API shape</div>
              <div className="mt-2 text-2xl font-semibold text-white">Validated auth, account, and admin routes</div>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default SecurityPage;
