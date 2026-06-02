import PageTransition from '../components/shared/PageTransition'
import { BookOpen } from 'lucide-react'

export default function Learn() {
  return (
    <PageTransition>
      <div className="pt-24 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rh-red-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-rh-red" />
            </div>
            <span className="text-sm font-medium text-rh-red">Learning Center</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-rh-black mb-6">
            What is llm-d?
          </h1>
          <p className="text-rh-gray-600 text-lg max-w-2xl">
            From first principles to production deployment. Learn at your own pace,
            starting from wherever you are.
          </p>

          <div className="mt-16 p-12 rounded-2xl bg-rh-gray-50 border border-rh-gray-100 text-center">
            <p className="text-rh-gray-500 text-lg font-medium">Coming in Chunk 2</p>
            <p className="text-rh-gray-400 text-sm mt-2">
              Interactive learning content with progressive depth levels
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
