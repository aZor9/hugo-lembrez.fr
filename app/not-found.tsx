import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="max-w-lg text-center space-y-6">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg text-gray-300">Cette page est introuvable.</p>
        <div className="flex justify-center">
          <Link href="/" className="btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
