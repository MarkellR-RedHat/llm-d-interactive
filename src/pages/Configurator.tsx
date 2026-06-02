import PageTransition from '../components/shared/PageTransition'
import { Settings2 } from 'lucide-react'

export default function Configurator() {
  return (
    <PageTransition>
      <div className="pt-28 min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-rh-red-50 flex items-center justify-center">
              <Settings2 className="w-6 h-6 text-rh-red" />
            </div>
            <span className="text-sm font-medium text-rh-red">Interactive Tool</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-8 leading-tight">
            Deployment Configurator
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl leading-relaxed">
            Select your model, hardware, and workload profile. Get a complete,
            ready-to-apply deployment config in seconds.
          </p>

          <div className="mt-20 p-14 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 3</p>
            <p className="text-rh-gray-400 text-sm mt-3 leading-relaxed max-w-lg mx-auto">
              Step-by-step wizard with live Helm values generation
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
