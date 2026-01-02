import Link from "next/link";
import { ArrowRight, Briefcase, FileText, Search, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm">
            <Sparkles className="w-4 h-4" />
            AI-Powered CV Optimization
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Land Your Dream Job with
            <span className="block mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Tailored CVs
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your master CV once. Search for jobs. Generate optimized CVs that match job requirements perfectly.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/profile"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Upload Master CV"
            description="Store all your skills, experiences, and achievements in one place."
            href="/profile"
          />
          <FeatureCard
            icon={<Search className="w-6 h-6" />}
            title="Search Jobs"
            description="Find relevant job postings from multiple sources in real-time."
            href="/search"
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Generate CV"
            description="AI matches your profile to job requirements and creates the perfect CV."
            href="/generate"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="p-6 rounded-xl bg-card/30 border border-border hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
    >
      <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
