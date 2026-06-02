import PageTransition from '../components/shared/PageTransition'
import { Search } from 'lucide-react'

export default function Troubleshooting() {
  return (
    <PageTransition>
      <div className="pt-24 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Search className="w-5 h-5 text-rh-green" />
            </div>
            <span className="text-sm font-medium text-rh-green">Reference</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-6">
            Troubleshooting
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl">
            Walk through interactive decision trees for common issues.
            Start with your symptom, end with the fix.
          </p>

          <div className="mt-16 p-12 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 6</p>
            <p className="text-rh-gray-400 text-sm mt-2">
              Interactive flowcharts for latency, OOM, throughput, and connectivity issues
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
