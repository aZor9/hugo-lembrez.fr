import LoginForm from "@/components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | Hugo Lembrez",
};

export default function LoginPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center px-4">
      <LoginForm />
    </main>
  );
}
