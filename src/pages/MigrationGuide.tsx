import PageTransition from '../components/shared/PageTransition'
import { ArrowRightLeft } from 'lucide-react'

export default function MigrationGuide() {
  return (
    <PageTransition>
      <div className="pt-28 min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-rh-gold" />
            </div>
            <span className="text-sm font-medium text-rh-gold">Reference</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-8 leading-tight">
            Migration Guide
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl leading-relaxed">
            Coming from vLLM, TGI, or Triton? Side-by-side comparison with config
            translation and step-by-step migration instructions.
          </p>

          <div className="mt-20 p-14 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 6</p>
            <p className="text-rh-gray-400 text-sm mt-3 leading-relaxed max-w-lg mx-auto">
              Interactive comparison tables and config translators
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
