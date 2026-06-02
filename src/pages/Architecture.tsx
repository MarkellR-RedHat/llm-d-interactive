import PageTransition from '../components/shared/PageTransition'
import { Layers3 } from 'lucide-react'

export default function Architecture() {
  return (
    <PageTransition>
      <div className="pt-24 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Layers3 className="w-5 h-5 text-rh-purple" />
            </div>
            <span className="text-sm font-medium text-rh-purple">Reference</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-6">
            Architecture Explorer
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl">
            Interactive diagram of every llm-d component. Click through to understand
            what each piece does, how to configure it, and what breaks when it fails.
          </p>

          <div className="mt-16 p-12 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 6</p>
            <p className="text-rh-gray-400 text-sm mt-2">
              Clickable component diagram with configuration details
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
