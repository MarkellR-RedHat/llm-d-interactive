import PageTransition from '../components/shared/PageTransition'
import { Network } from 'lucide-react'

export default function RoutingVisualizer() {
  return (
    <PageTransition>
      <div className="pt-28 min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Network className="w-6 h-6 text-rh-blue" />
            </div>
            <span className="text-sm font-medium text-rh-blue">Interactive Tool</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-8 leading-tight">
            Routing Strategy Visualizer
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl leading-relaxed">
            Watch requests flow through your cluster and see how different routing
            policies distribute work across replicas in real time.
          </p>

          <div className="mt-20 p-14 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 4</p>
            <p className="text-rh-gray-400 text-sm mt-3 leading-relaxed max-w-lg mx-auto">
              Animated simulation with policy toggling and failure injection
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
