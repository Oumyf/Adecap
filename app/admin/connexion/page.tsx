import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Login() {
  if (await getUser()) redirect("/admin");
  return (
    <main className="login diag">
      <div style={{ width: "100%", maxWidth: 420 }}>
        <a className="logo" href="/">
          <span className="mark" aria-hidden="true" />
          <span className="wm">
            <b>ADECAP</b>
            <small>ENTERTAINMENT</small>
          </span>
        </a>
        <div className="box">
          <div>
            <p className="eyebrow">Espace équipe</p>
            <h1>Connexion</h1>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
