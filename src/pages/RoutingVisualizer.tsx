import PageTransition from '../components/shared/PageTransition'
import { Network } from 'lucide-react'

export default function RoutingVisualizer() {
  return (
    <PageTransition>
      <div className="pt-24 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Network className="w-5 h-5 text-rh-blue" />
            </div>
            <span className="text-sm font-medium text-rh-blue">Interactive Tool</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-6">
            Routing Strategy Visualizer
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl">
            Watch requests flow through your cluster and see how different routing
            policies distribute work across replicas in real time.
          </p>

          <div className="mt-16 p-12 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 4</p>
            <p className="text-rh-gray-400 text-sm mt-2">
              Animated simulation with policy toggling and failure injection
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
