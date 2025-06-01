import { FileText, Zap, Lock, BarChart2, MessageSquare, FileQuestion, FileSearch } from 'lucide-react';
export default function FeaturesPage() {
  const features = [
    {
      icon: <FileText className="w-8 h-8 text-indigo-500" />,
      title: 'Smart Summarization',
      description: 'Get concise summaries of your PDFs in seconds, saving you hours of reading time.'
    },
    {
      icon: <Zap className="w-8 h-8 text-indigo-500" />,
      title: 'Quick Analysis',
      description: 'Instantly analyze documents and extract key information with AI-powered technology.'
    },
    {
      icon: <Lock className="w-8 h-8 text-indigo-500" />,
      title: 'Secure Processing',
      description: 'Your documents are processed securely and never stored longer than necessary.'
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-indigo-500" />,
      title: 'Advanced Analytics',
      description: 'Gain insights from your documents with powerful analytics and visualizations.'
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-indigo-500" />,
      title: 'Chat with Documents',
      description: 'Ask questions about your documents and get instant answers from our AI.'
    },
    {
      icon: <FileSearch className="w-8 h-8 text-indigo-500" />,
      title: 'Smart Search',
      description: 'Quickly find information across all your uploaded documents with intelligent search.'
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover how InsightPDF can transform the way you work with documents.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800/50 p-6 rounded-xl hover:bg-slate-800/70 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
