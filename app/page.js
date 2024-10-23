import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Presentation, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-800">Welcome to SlideFlow</h1>
          <p className="text-xl text-gray-600 mb-8">Master your presentations with ease and confidence</p>
          <Link href="/presentations" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full inline-flex items-center transition-colors">
            Get Started
            <ArrowRight className="ml-2" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Clock className="w-12 h-12 text-blue-500" />}
            title="Time Management"
            description="Practice and perfect your timing for each slide"
          />
          <FeatureCard
            icon={<Presentation className="w-12 h-12 text-blue-500" />}
            title="Slide Organization"
            description="Easily upload and manage your presentation slides"
          />
          <FeatureCard
            icon={<Users className="w-12 h-12 text-blue-500" />}
            title="Audience Engagement"
            description="Improve your delivery and engage your audience"
          />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to elevate your presentations?</h2>
          <Link href="/presentations" className="text-blue-500 hover:text-blue-600 font-semibold inline-flex items-center">
            View Your Presentations
            <ArrowRight className="ml-2" />
          </Link>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
