import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 px-4">
      <div className="text-center max-w-xl">
        <div className="text-6xl mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo2.png" alt="Plato" className="w-32 h-32 mx-auto object-contain" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Plato</h1>
        <p className="text-lg text-gray-600 mb-8">
          Digital menus for restaurants. Simple QR codes, beautiful menus,
          happy customers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary text-center">
            Restaurant Login
          </Link>
          <Link href="/register" className="btn-secondary text-center">
            Get Started Free
          </Link>
        </div>
      </div>
    </main>
  );
}
