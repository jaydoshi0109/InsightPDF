import PricingSection from '@/components/home/pricing-section';
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Start with our free plan and upgrade anytime.
          </p>
        </div>
        <PricingSection />
      </div>
    </div>
  );
}
