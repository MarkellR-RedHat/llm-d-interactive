import PageTransition from '../components/shared/PageTransition'
import { Search } from 'lucide-react'

export default function Troubleshooting() {
  return (
    <PageTransition>
      <div className="pt-28 min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Search className="w-6 h-6 text-rh-green" />
            </div>
            <span className="text-sm font-medium text-rh-green">Reference</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-8 leading-tight">
            Troubleshooting
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl leading-relaxed">
            Walk through interactive decision trees for common issues.
            Start with your symptom, end with the fix.
          </p>

          <div className="mt-20 p-14 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 6</p>
            <p className="text-rh-gray-400 text-sm mt-3 leading-relaxed max-w-lg mx-auto">
              Interactive flowcharts for latency, OOM, throughput, and connectivity issues
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
