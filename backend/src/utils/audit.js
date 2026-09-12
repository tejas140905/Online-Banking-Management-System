const pool = require("../config/db");

// Append-only activity trail for admin visibility: logins, registrations,
// transfers, profile/password changes, and admin actions all land in
// admin_logs, viewable at GET /api/admin/logs.
// Never throws: audit must not break the operation being recorded.
const audit = (userId, action) =>
  pool
    .query("INSERT INTO admin_logs (admin_id, action) VALUES (?, ?)", [userId, action])
    .catch(() => {});

module.exports = { audit };
