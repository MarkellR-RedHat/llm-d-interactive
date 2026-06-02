import PageTransition from '../components/shared/PageTransition'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import ArchitecturePreview from '../components/landing/ArchitecturePreview'
import CTASection from '../components/landing/CTASection'

export default function Landing() {
  return (
    <PageTransition>
      <HeroSection />
      <FeaturesSection />
      <ArchitecturePreview />
      <CTASection />
    </PageTransition>
  )
}
