export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="fixed z-10 w-full border-b border-gray-100 bg-white/70 backdrop-blur-md">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                GitLic
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* <a
                href="#"
                className="text-gray-600 transition-colors hover:text-indigo-600"
              >
                Pricing
              </a>
              <a
                href="#"
                className="text-gray-600 transition-colors hover:text-indigo-600"
              >
                Features
              </a> */}
              <a
                href="/dashboard"
                className="inline-flex items-center rounded-full border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                Sign In
              </a>
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16 pt-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            Revolutionize Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
              GitHub Workflow
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-gray-600">
            AI-powered collaboration tools for modern development teams. From
            code reviews to meeting summaries, GitLic helps you stay productive
            and informed.
          </p>
          <div className="mt-12 flex justify-center gap-6">
            <a
              href="/dashboard"
              className="transform rounded-full bg-gradient-to-r from-blue-600 to-blue-600 px-8 py-4 text-base font-medium text-white shadow-lg transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-700 hover:shadow-xl"
            >
              Start Free Trial
            </a>
            <a
              href="#"
              className="text-blue -600 rounded-full border-2 border-blue-600 bg-transparent px-8 py-4 text-base font-medium transition-all hover:bg-indigo-50"
            >
              View Demo
            </a>
          </div>

          <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Smart Code Reviews",
                description:
                  "Get AI-powered summaries of repository comments and pull requests",
                icon: "🤖",
              },
              {
                title: "Meeting Intelligence",
                description:
                  "Never miss important details with AI meeting summaries and chat",
                icon: "💡",
              },
              {
                title: "Credit System",
                description:
                  "Pay only for what you use with our flexible credit-based pricing",
                icon: "💳",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="transform rounded-xl border-2 border-blue-100 bg-white/60 p-8 shadow-lg shadow-blue-100 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
