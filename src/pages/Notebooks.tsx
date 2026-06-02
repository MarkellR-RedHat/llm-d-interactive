import PageTransition from '../components/shared/PageTransition'
import { FlaskConical } from 'lucide-react'

export default function Notebooks() {
  return (
    <PageTransition>
      <div className="pt-24 min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600">Hands-on Tutorials</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-8 leading-tight">
            Jupyter Notebooks
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl leading-relaxed">
            Learn by doing. These interactive notebooks walk you through real llm-d
            workflows, from basic setup to advanced routing and autoscaling configuration.
            Run them locally or in your preferred Jupyter environment.
          </p>

          <div className="mt-20 p-14 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 2</p>
            <p className="text-rh-gray-400 text-sm mt-3 leading-relaxed max-w-lg mx-auto">
              Interactive Jupyter notebooks covering deployment basics, routing policy
              comparison, capacity planning experiments, and performance tuning.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
