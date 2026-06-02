import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import Learn from './pages/Learn'
import Configurator from './pages/Configurator'
import RoutingVisualizer from './pages/RoutingVisualizer'
import CapacityPlanner from './pages/CapacityPlanner'
import Architecture from './pages/Architecture'
import MigrationGuide from './pages/MigrationGuide'
import Troubleshooting from './pages/Troubleshooting'

function App() {
  const location = useLocation()

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/configurator" element={<Configurator />} />
          <Route path="/routing" element={<RoutingVisualizer />} />
          <Route path="/capacity" element={<CapacityPlanner />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/migration" element={<MigrationGuide />} />
          <Route path="/troubleshooting" element={<Troubleshooting />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

export default App
