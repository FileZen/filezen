import Link from 'next/link';

const recipes = [
  {
    title: 'Custom Multipart Upload',
    description: 'Manual multipart upload implementation with custom chunking control and progress tracking.',
    href: '/multipart-upload',
    icon: '📁',
    features: ['Manual Drag & Drop', 'Custom URL Upload', 'Manual Progress Tracking', 'Custom Error Handling'],
  },
  {
    title: 'URL Upload',
    description: 'Upload files directly from URLs with automatic file detection.',
    href: '/url-upload',
    icon: '🌐',
    features: ['URL Validation', 'File Type Detection', 'MIME Type Extraction', 'Remote Fetching'],
    comingSoon: true,
  },
  {
    title: 'Bulk Upload',
    description: 'Upload multiple files simultaneously with batch processing.',
    href: '/bulk-upload',
    icon: '📦',
    features: ['Multiple Selection', 'Batch Processing', 'Queue Management', 'Parallel Uploads'],
    comingSoon: true,
  },
  {
    title: 'Progress Tracking',
    description: 'Real-time upload progress monitoring and status updates.',
    href: '/progress-tracking',
    icon: '📊',
    features: ['Real-time Progress', 'Upload Status', 'Speed Tracking', 'Cancel Operations'],
    comingSoon: true,
  },
  {
    title: 'AI Image Generation',
    description: 'Generate AI-powered images and upload them to FileZen with one click.',
    href: '/ai-image-generation',
    icon: '🎨',
    features: ['AI-Generated Images', 'Custom Prompts', 'Instant Generation', 'Manual Upload'],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              FileZen JavaScript Recipes
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              Discover practical FileZen implementation patterns through interactive recipes
              and step-by-step demonstrations. From simple uploads to advanced multipart processing.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/multipart-upload"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started
              </Link>
              <a href="#recipes" className="text-sm font-semibold leading-6 text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Section */}
      <div id="recipes" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              JavaScript SDK Recipes
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Practical implementation patterns for modern web applications
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {recipes.map((recipe) => (
              <div key={recipe.title} className="relative group">
                <div className="rounded-lg bg-gray-800 p-6 transition-transform group-hover:scale-105">
                  <div className="flex items-center">
                    <span className="text-3xl">{recipe.icon}</span>
                    <h3 className="ml-3 text-xl font-semibold text-white">
                      {recipe.title}
                    </h3>
                    {recipe.comingSoon && (
                      <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-gray-400">{recipe.description}</p>
                  
                  <ul className="mt-4 space-y-2">
                    {recipe.features.map((item) => (
                      <li key={item} className="flex items-center text-sm text-gray-300">
                        <span className="mr-2 text-green-400">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {recipe.comingSoon ? (
                      <button
                        disabled
                        className="w-full rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    ) : (
                      <Link
                        href={recipe.href}
                        className="block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Try Recipe
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ready to build with FileZen?
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Start integrating powerful file upload capabilities into your application today.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <a
                href="https://docs.filezen.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                View Documentation
              </a>
              <a
                href="https://github.com/filezen"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
