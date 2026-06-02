import PageTransition from '../components/shared/PageTransition'
import { BookOpen } from 'lucide-react'

export default function Learn() {
  return (
    <PageTransition>
      <div className="pt-28 min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 py-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-rh-red-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-rh-red" />
            </div>
            <span className="text-sm font-medium text-rh-red">Learning Center</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-8 leading-tight">
            What is llm-d?
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl leading-relaxed">
            From first principles to production deployment. Learn at your own pace,
            starting from wherever you are.
          </p>

          <div className="mt-20 p-14 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 2</p>
            <p className="text-rh-gray-400 text-sm mt-3 leading-relaxed max-w-lg mx-auto">
              Interactive learning content with progressive depth levels
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
