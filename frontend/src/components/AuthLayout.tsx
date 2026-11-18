import type { ReactNode } from "react";

function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <div className={`brand-mark${large ? " large" : ""}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2 20 5v6c0 5.2-3.4 9-8 11-4.6-2-8-5.8-8-11V5l8-3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="9" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M8.2 16c.8-2 2-2.9 3.8-2.9s3 .9 3.8 2.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

type Role = "super" | "admin" | "user" | "guest";

const ROLE_GRADIENTS: Record<Role, [string, string]> = {
  super: ["#7b8cff", "#5b3fe0"],
  admin: ["#5cc4ff", "#2f6df0"],
  user: ["#b07bff", "#6f3ee8"],
  guest: ["#a9b4cc", "#6b7896"],
};

/* Head + shoulders silhouette, offset so a badge fits bottom-right */
function Person({ fill }: { fill: string }) {
  return (
    <>
      <circle cx="17" cy="12" r="7" fill={fill} />
      <path d="M3.5 34c0-7.6 6-12.5 13.5-12.5S30.5 26.4 30.5 34Z" fill={fill} />
    </>
  );
}

function RoleIcon({ role }: { role: Role }) {
  const id = `roleGrad-${role}`;
  const fill = `url(#${id})`;
  const [from, to] = ROLE_GRADIENTS[role];

  return (
    <svg className="role-icon" viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>

      {role === "guest" ? (
        <>
          {/* Group of three people */}
          <circle cx="9" cy="14" r="4.5" fill={fill} opacity=".75" />
          <path d="M1 32c0-5.5 3.6-9 8-9s8 3.5 8 9Z" fill={fill} opacity=".75" />
          <circle cx="31" cy="14" r="4.5" fill={fill} opacity=".75" />
          <path d="M23 32c0-5.5 3.6-9 8-9s8 3.5 8 9Z" fill={fill} opacity=".75" />
          <circle cx="20" cy="11.5" r="6" fill={fill} />
          <path d="M9 34c0-7 4.9-11.5 11-11.5S31 27 31 34Z" fill={fill} />
        </>
      ) : (
        <>
          <Person fill={fill} />
          {/* White ring behind the badge so it pops off the silhouette */}
          <circle cx="30.5" cy="29.5" r="9" fill="#fff" />

          {role === "super" && (
            <path
              d="m30.5 22.6 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7Z"
              fill="#ffb21e"
              stroke="#f59a00"
              strokeWidth=".8"
              strokeLinejoin="round"
            />
          )}

          {role === "admin" && (
            <g fill="#2f8ff0">
              <path d="M29.2 22.5h2.6l.4 2.1a5.4 5.4 0 0 1 1.5.9l2-.7 1.3 2.2-1.6 1.4a5.4 5.4 0 0 1 0 1.8l1.6 1.4-1.3 2.2-2-.7a5.4 5.4 0 0 1-1.5.9l-.4 2.1h-2.6l-.4-2.1a5.4 5.4 0 0 1-1.5-.9l-2 .7-1.3-2.2 1.6-1.4a5.4 5.4 0 0 1 0-1.8L24 27l1.3-2.2 2 .7a5.4 5.4 0 0 1 1.5-.9Z" />
              <circle cx="30.5" cy="29.5" r="2" fill="#fff" />
            </g>
          )}

          {role === "user" && (
            <g fill="#7a45f0">
              <rect x="25" y="30" width="2.8" height="5" rx=".8" />
              <rect x="29.1" y="27" width="2.8" height="8" rx=".8" />
              <rect x="33.2" y="23.5" width="2.8" height="11.5" rx=".8" />
            </g>
          )}
        </>
      )}
    </svg>
  );
}

function ShieldIllustration() {
  return (
    <div className="security-visual" aria-label="Role based access illustration">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="role-card role-super">
        <RoleIcon role="super" />
        <strong>Super Admin</strong>
      </div>
      <div className="role-card role-admin">
        <RoleIcon role="admin" />
        <strong>Admin</strong>
      </div>
      <div className="role-card role-user">
        <RoleIcon role="user" />
        <strong>User</strong>
      </div>
      <div className="role-card role-guest">
        <RoleIcon role="guest" />
        <strong>Guest</strong>
      </div>
      <div className="main-shield">
        <svg viewBox="0 0 180 200" role="img" aria-label="Secure access shield">
          <defs>
            <linearGradient id="shieldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#66d7ff" />
              <stop offset="100%" stopColor="#3455e8" />
            </linearGradient>
            <linearGradient id="lockGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#b9c9ff" />
            </linearGradient>
          </defs>
          <path
            d="M90 8 158 35v54c0 48-28 79-68 101C50 168 22 137 22 89V35L90 8Z"
            fill="url(#shieldGradient)"
            stroke="#8adfff"
            strokeWidth="5"
          />
          <path
            d="M90 23 143 44v44c0 38-21 64-53 83-32-19-53-45-53-83V44l53-21Z"
            fill="none"
            stroke="#ffffff"
            strokeOpacity=".35"
            strokeWidth="3"
          />
          <rect x="58" y="86" width="64" height="55" rx="12" fill="url(#lockGradient)" />
          <path
            d="M70 88V70a20 20 0 0 1 40 0v18"
            fill="none"
            stroke="#ffffff"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <circle cx="90" cy="109" r="7" fill="#4052d8" />
          <path d="M90 115v12" stroke="#4052d8" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export { BrandMark };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="rbac-page auth-page">
      <section className="brand-panel">
        <header className="brand-header">
          <BrandMark />
          <div>
            <h2>RBAC Console</h2>
            <p>Role Based Access Control</p>
          </div>
        </header>

        <div className="brand-copy">
          <h1>
            Secure Access
            <br />
            for the <span>Right Role</span>
          </h1>
          <p>
            Manage roles, control permissions,
            <br className="desktop-break" /> and access your application securely.
          </p>
        </div>

        <ShieldIllustration />

        <div className="feature-row">
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>
              Secure
              <br />
              Authentication
            </span>
          </div>
          <div className="feature">
            <span className="feature-icon">↯</span>
            <span>
              Role-Based
              <br />
              Access
            </span>
          </div>
          <div className="feature">
            <span className="feature-icon">▥</span>
            <span>
              Manage
              <br />
              Permissions
            </span>
          </div>
        </div>

        <footer className="brand-footer">© 2026 RBAC Console. All rights reserved.</footer>
      </section>

      {/* S-curve between blue brand panel and login panel */}
      <svg width="0" height="0" className="auth-clip-defs" aria-hidden="true">
        <defs>
          <clipPath id="authBrandCurve" clipPathUnits="objectBoundingBox">
            <path d="M0 0 H0.90 C0.98 0.18, 1.0 0.32, 0.88 0.50 C0.76 0.68, 0.92 0.84, 0.94 1 H0 Z" />
          </clipPath>
        </defs>
      </svg>

      <section className="login-panel">{children}</section>
    </main>
  );
}
