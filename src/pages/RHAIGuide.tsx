import { useState, useEffect, useRef } from 'react'
import { Check, Copy, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/shared/PageTransition'
import Expand from '../components/shared/Expand'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PURPLE = '#9b4d9b'
const PURPLE_DARK = '#7f317f'
const PURPLE_LIGHT = '#f3e8f3'
const BLACK = '#151515'
const GRAY_600 = '#4D4D4D'
const GRAY_100 = '#E0E0E0'
const GRAY_50 = '#F0F0F0'

const NBSP_HYPHEN = '‑' // non-breaking hyphen

/* ------------------------------------------------------------------ */
/*  Step data                                                          */
/* ------------------------------------------------------------------ */

interface StepDef {
  number: string
  title: string
}

const steps: StepDef[] = [
  { number: '01', title: 'Access RHPDS' },
  { number: '02', title: 'Provision a Cluster' },
  { number: '03', title: 'Install the oc CLI' },
  { number: '04', title: 'Log In to Your Cluster' },
  { number: '05', title: 'Install Required Operators' },
  { number: '06', title: 'Deploy llm‑d' },
  { number: '07', title: 'Test Your Deployment' },
  { number: '08', title: 'Clean Up' },
]

/* ------------------------------------------------------------------ */
/*  Code Block helper                                                  */
/* ------------------------------------------------------------------ */

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'relative', margin: '20px 0' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#8A8D90',
          padding: '4px',
        }}
        title="Copy to clipboard"
      >
        {copied ? (
          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#2E7D32' }} />
        ) : (
          <Copy style={{ width: '16px', height: '16px' }} />
        )}
      </button>
      <pre
        style={{
          backgroundColor: '#1E1E1E',
          color: '#D4D4D4',
          padding: '20px 24px',
          borderRadius: '4px',
          fontFamily: 'var(--font-mono, "Source Code Pro", monospace)',
          fontSize: '14px',
          lineHeight: '24px',
          overflowX: 'auto',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {children}
      </pre>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Inline code helper                                                 */
/* ------------------------------------------------------------------ */

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: 'var(--font-mono, "Source Code Pro", monospace)',
        fontSize: '14px',
        backgroundColor: GRAY_50,
        padding: '2px 6px',
        borderRadius: '3px',
        color: PURPLE_DARK,
      }}
    >
      {children}
    </code>
  )
}

/* ------------------------------------------------------------------ */
/*  Step Section wrapper                                               */
/* ------------------------------------------------------------------ */

function StepSection({
  stepIndex,
  stepRef,
  children,
}: {
  stepIndex: number
  stepRef: (el: HTMLDivElement | null) => void
  children: React.ReactNode
}) {
  const step = steps[stepIndex]
  return (
    <div
      ref={stepRef}
      id={`step-${stepIndex}`}
      style={{ marginBottom: '64px', scrollMarginTop: '160px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px',
            fontWeight: 700,
            color: PURPLE,
            lineHeight: '48px',
            opacity: 0.25,
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          {step.number}
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            color: BLACK,
            lineHeight: '36px',
            margin: 0,
            paddingTop: '6px',
          }}
        >
          {step.title}
        </h2>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '17px',
          lineHeight: '30px',
          color: '#212121',
          paddingLeft: '68px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Progress Tracker (sidebar on desktop, horizontal on mobile)        */
/* ------------------------------------------------------------------ */

function ProgressTracker({
  activeStep,
  completedSteps,
  onStepClick,
}: {
  activeStep: number
  completedSteps: Set<number>
  onStepClick: (idx: number) => void
}) {
  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav
        className="hidden lg:block"
        style={{
          position: 'sticky',
          top: '140px',
          width: '220px',
          flexShrink: 0,
          alignSelf: 'flex-start',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#8A8D90',
            marginBottom: '16px',
            paddingLeft: '12px',
          }}
        >
          Progress
        </div>
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx)
          const isActive = activeStep === idx
          return (
            <button
              key={idx}
              onClick={() => onStepClick(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 12px',
                backgroundColor: isActive ? PURPLE_LIGHT : 'transparent',
                border: 'none',
                borderLeft: isActive ? `3px solid ${PURPLE}` : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                borderRadius: '0 4px 4px 0',
              }}
            >
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: isCompleted ? PURPLE : isActive ? PURPLE : GRAY_100,
                  color: isCompleted || isActive ? '#fff' : '#8A8D90',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {isCompleted ? (
                  <Check style={{ width: '12px', height: '12px' }} />
                ) : (
                  step.number
                )}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? PURPLE_DARK : isCompleted ? PURPLE : GRAY_600,
                  lineHeight: '18px',
                }}
              >
                {step.title}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Mobile: horizontal scrollable bar */}
      <nav
        className="lg:hidden"
        style={{
          position: 'sticky',
          top: '90px',
          zIndex: 50,
          backgroundColor: '#fff',
          borderBottom: `1px solid ${GRAY_100}`,
          padding: '12px 0',
          marginBottom: '24px',
          overflowX: 'auto',
          display: 'flex',
          gap: '6px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx)
          const isActive = activeStep === idx
          return (
            <button
              key={idx}
              onClick={() => onStepClick(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: isActive ? PURPLE_LIGHT : 'transparent',
                border: isActive ? `1px solid ${PURPLE}` : `1px solid ${GRAY_100}`,
                borderRadius: '20px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCompleted ? PURPLE : isActive ? PURPLE : GRAY_100,
                  color: isCompleted || isActive ? '#fff' : '#8A8D90',
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {isCompleted ? (
                  <Check style={{ width: '10px', height: '10px' }} />
                ) : (
                  step.number
                )}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? PURPLE_DARK : GRAY_600,
                }}
              >
                {step.title}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function RHAIGuide() {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  const toggleComplete = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  const scrollToStep = (idx: number) => {
    const el = stepRefs.current[idx]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Track active step based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = stepRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) {
              setActiveStep(idx)
            }
          }
        }
      },
      { rootMargin: '-160px 0px -60% 0px', threshold: 0.1 }
    )

    const refs = stepRefs.current
    refs.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      refs.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  const setStepRef = (idx: number) => (el: HTMLDivElement | null) => {
    stepRefs.current[idx] = el
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        {/* ── Header ── */}
        <div
          style={{
            paddingTop: '140px',
            paddingBottom: '48px',
            backgroundColor: '#EDEDED',
          }}
        >
          <div
            style={{
              maxWidth: '1244px',
              margin: '0 auto',
              padding: '0 30px',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                backgroundColor: PURPLE,
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              Step{NBSP_HYPHEN}by{NBSP_HYPHEN}Step Guide
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 300,
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                color: BLACK,
                marginBottom: '20px',
                maxWidth: '800px',
              }}
            >
              Deploy llm{NBSP_HYPHEN}d on Red Hat OpenShift AI
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '20px',
                lineHeight: '32px',
                color: GRAY_600,
                maxWidth: '720px',
              }}
            >
              A complete walkthrough from zero to serving LLM inference on OpenShift,
              using the Red Hat Product Demo System.
            </p>
          </div>
        </div>

        {/* ── Prerequisites ── */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '32px 30px 0',
          }}
        >
          <div
            style={{
              backgroundColor: PURPLE_LIGHT,
              border: `1px solid ${PURPLE}`,
              borderRadius: '6px',
              padding: '28px 32px',
              marginBottom: '48px',
              maxWidth: '900px',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 700,
                color: PURPLE_DARK,
                marginBottom: '12px',
              }}
            >
              Prerequisites
            </h3>
            <ul
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: '28px',
                color: '#212121',
                listStyleType: 'disc',
                paddingLeft: '20px',
                margin: 0,
              }}
            >
              <li>A Red Hat SSO account (your @redhat.com login)</li>
              <li>Access to RHPDS (demo.redhat.com)</li>
              <li>A web browser</li>
              <li>
                About 45 minutes for the first time (15 minutes for subsequent
                deployments)
              </li>
            </ul>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                lineHeight: '22px',
                color: GRAY_600,
                marginTop: '14px',
                marginBottom: 0,
              }}
            >
              <strong>Note:</strong> If you do not have RHPDS access, ask your manager
              or a Solutions Architect on your team.
            </p>
          </div>
        </div>

        {/* ── Main content: sidebar + steps ── */}
        <div
          style={{
            maxWidth: '1244px',
            margin: '0 auto',
            padding: '0 30px 80px',
            display: 'flex',
            gap: '48px',
            alignItems: 'flex-start',
          }}
        >
          <ProgressTracker
            activeStep={activeStep}
            completedSteps={completedSteps}
            onStepClick={scrollToStep}
          />

          <div style={{ flex: 1, minWidth: 0, maxWidth: '820px' }}>
            {/* ── Step 1: Access RHPDS ── */}
            <StepSection stepIndex={0} stepRef={setStepRef(0)}>
              <ol style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
                <li style={{ marginBottom: '10px' }}>
                  Go to{' '}
                  <a
                    href="https://demo.redhat.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: PURPLE, fontWeight: 600 }}
                  >
                    https://demo.redhat.com
                  </a>
                </li>
                <li style={{ marginBottom: '10px' }}>
                  Log in with your Red Hat SSO credentials (the same login you use for
                  other Red Hat internal tools).
                </li>
                <li style={{ marginBottom: '10px' }}>
                  If this is your first time, you may need to accept terms of service.
                </li>
                <li>
                  You should see the Demo System dashboard with available catalog items.
                </li>
              </ol>

              <Expand label="I cannot access demo.redhat.com">
                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '8px' }}>
                    If you are on a corporate network, check that you are connected to
                    the VPN.
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Try a different browser or clear your cache.
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Contact IT Help for SSO or access issues.
                  </li>
                  <li>
                    Alternative: ask a Solutions Architect on your team to provision a
                    cluster for you and share the credentials.
                  </li>
                </ul>
              </Expand>

              <MarkCompleteButton
                idx={0}
                completed={completedSteps.has(0)}
                onToggle={toggleComplete}
              />
            </StepSection>

            {/* ── Step 2: Provision a Cluster ── */}
            <StepSection stepIndex={1} stepRef={setStepRef(1)}>
              <ol style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
                <li style={{ marginBottom: '10px' }}>
                  In the RHPDS catalog, search for <strong>"OpenShift"</strong> or{' '}
                  <strong>"GPU"</strong>.
                </li>
                <li style={{ marginBottom: '10px' }}>
                  Look for a catalog item that includes GPU-enabled worker nodes (such
                  as "OpenShift 4.x with NVIDIA GPUs" or similar).
                </li>
                <li style={{ marginBottom: '10px' }}>
                  Click <strong>"Order"</strong> and configure:
                  <ul style={{ paddingLeft: '20px', marginTop: '8px', listStyleType: 'disc' }}>
                    <li>
                      <strong>Region:</strong> pick the closest to you
                    </li>
                    <li>
                      <strong>Duration:</strong> 4 hours is enough for a demo
                    </li>
                    <li>
                      <strong>Worker nodes:</strong> at least 2 with GPU (if
                      configurable)
                    </li>
                  </ul>
                </li>
                <li style={{ marginBottom: '10px' }}>
                  Click <strong>"Submit"</strong> and wait for provisioning (typically
                  15 to 30 minutes).
                </li>
                <li>
                  You will receive an email with your cluster URL, admin username, and
                  password.
                </li>
              </ol>

              <Expand label="What if there is no GPU catalog item?">
                <p style={{ marginBottom: '8px' }}>
                  You have a few alternatives:
                </p>
                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '8px' }}>
                    You can deploy without GPU to test the overall flow. The model
                    server will not be able to load large models, but you can verify
                    the deployment pipeline end to end.
                  </li>
                  <li>
                    Use the{' '}
                    <a
                      href="https://developers.redhat.com/developer-sandbox"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: PURPLE, fontWeight: 600 }}
                    >
                      Developer Sandbox
                    </a>{' '}
                    at developers.redhat.com for a non-GPU walkthrough.
                  </li>
                </ul>
              </Expand>

              <MarkCompleteButton
                idx={1}
                completed={completedSteps.has(1)}
                onToggle={toggleComplete}
              />
            </StepSection>

            {/* ── Step 3: Install the oc CLI ── */}
            <StepSection stepIndex={2} stepRef={setStepRef(2)}>
              <p style={{ marginBottom: '12px' }}>
                The <Code>oc</Code> command is the OpenShift CLI (like{' '}
                <Code>kubectl</Code> but with OpenShift-specific features).
              </p>

              <ol style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
                <li style={{ marginBottom: '10px' }}>
                  Go to your OpenShift web console (the URL from the provisioning
                  email).
                </li>
                <li style={{ marginBottom: '10px' }}>
                  Click the <strong>"?"</strong> help icon in the top right, then{' '}
                  <strong>"Command Line Tools"</strong>.
                </li>
                <li style={{ marginBottom: '10px' }}>
                  Download the <Code>oc</Code> binary for your operating system (macOS,
                  Linux, or Windows).
                </li>
                <li>
                  For macOS, extract and move to your PATH:
                </li>
              </ol>

              <CodeBlock>{`tar xzf oc.tar.gz
sudo mv oc /usr/local/bin/
oc version`}</CodeBlock>

              <Expand label="I already have kubectl. Do I need oc too?">
                <p>
                  <Code>oc</Code> wraps <Code>kubectl</Code> and adds
                  OpenShift-specific commands like <Code>oc new-project</Code>,{' '}
                  <Code>oc create route</Code>, and more. You can use{' '}
                  <Code>kubectl</Code> for most standard Kubernetes operations, but{' '}
                  <Code>oc</Code> is needed for managing OpenShift Routes and Security
                  Context Constraints (SCCs).
                </p>
              </Expand>

              <MarkCompleteButton
                idx={2}
                completed={completedSteps.has(2)}
                onToggle={toggleComplete}
              />
            </StepSection>

            {/* ── Step 4: Log In to Your Cluster ── */}
            <StepSection stepIndex={3} stepRef={setStepRef(3)}>
              <ol style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
                <li style={{ marginBottom: '10px' }}>Open a terminal.</li>
                <li style={{ marginBottom: '10px' }}>
                  Copy the login command from the OpenShift web console: click your
                  username in the top right, then{' '}
                  <strong>"Copy login command"</strong>, then{' '}
                  <strong>"Display Token"</strong>.
                </li>
                <li style={{ marginBottom: '10px' }}>
                  Run the command (it looks like this):
                </li>
              </ol>

              <CodeBlock>{`oc login --token=sha256~XXXXX --server=https://api.your-cluster.example.com:6443`}</CodeBlock>

              <p style={{ marginBottom: '8px' }}>Verify your connection:</p>

              <CodeBlock>{`oc get nodes`}</CodeBlock>

              <p style={{ marginBottom: '8px' }}>
                This should list your cluster nodes. To check for GPU nodes (if the NFD
                operator is already installed):
              </p>

              <CodeBlock>{`oc get nodes -l nvidia.com/gpu.present=true`}</CodeBlock>

              <p style={{ marginBottom: '8px' }}>
                Create a project (namespace) for llm{NBSP_HYPHEN}d:
              </p>

              <CodeBlock>{`oc new-project llm-d`}</CodeBlock>

              <Expand label="What is a project vs a namespace?">
                <p>
                  OpenShift projects are Kubernetes namespaces with additional metadata
                  and isolation features. The <Code>oc new-project</Code> command
                  creates a namespace, sets up default role bindings, and switches your
                  context to use it automatically. You can think of them as the same
                  thing for most practical purposes.
                </p>
              </Expand>

              <MarkCompleteButton
                idx={3}
                completed={completedSteps.has(3)}
                onToggle={toggleComplete}
              />
            </StepSection>

            {/* ── Step 5: Install Required Operators ── */}
            <StepSection stepIndex={4} stepRef={setStepRef(4)}>
              <p style={{ marginBottom: '16px' }}>
                This step uses the OpenShift web console (browser-based, not CLI).
              </p>

              {/* Sub-step 5a */}
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: '12px',
                  marginTop: '28px',
                }}
              >
                5a. Install Node Feature Discovery (NFD) Operator
              </h4>
              <ol style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  Go to the OpenShift web console.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Navigate to <strong>Operators</strong>, then{' '}
                  <strong>OperatorHub</strong>.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Search for <strong>"Node Feature Discovery"</strong>.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Click <strong>"Install"</strong>, accept defaults, click{' '}
                  <strong>"Install"</strong> again.
                </li>
                <li>Wait for status to show "Succeeded".</li>
              </ol>

              {/* Sub-step 5b */}
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: '12px',
                  marginTop: '28px',
                }}
              >
                5b. Install NVIDIA GPU Operator
              </h4>
              <ol style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  In OperatorHub, search for <strong>"NVIDIA GPU Operator"</strong>.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Click <strong>"Install"</strong>, accept defaults, click{' '}
                  <strong>"Install"</strong>.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  After install, create a <strong>ClusterPolicy</strong> (the operator
                  will prompt you to do this).
                </li>
                <li>
                  Wait for GPU pods to appear on your GPU nodes (this takes 5 to 10
                  minutes). Verify:
                </li>
              </ol>

              <CodeBlock>{`oc get pods -n nvidia-gpu-operator`}</CodeBlock>

              <p style={{ marginBottom: '8px' }}>
                You should see several pods in a Running state.
              </p>

              {/* Sub-step 5c */}
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: '12px',
                  marginTop: '28px',
                }}
              >
                5c. Install LeaderWorkerSet Operator
              </h4>
              <ol style={{ paddingLeft: '20px', margin: '0 0 8px' }}>
                <li style={{ marginBottom: '8px' }}>
                  In OperatorHub, search for <strong>"LeaderWorkerSet"</strong>.
                </li>
                <li>
                  If not available in the catalog, install manually:
                </li>
              </ol>

              <CodeBlock>{`oc apply -f https://github.com/kubernetes-sigs/lws/releases/latest/download/manifests.yaml`}</CodeBlock>

              <Expand label="How do I know the operators are working?">
                <p style={{ marginBottom: '8px' }}>
                  Run these commands to verify each operator:
                </p>
                <CodeBlock>{`# Check installed operators
oc get csv -A | grep -i nvidia

# Check GPU operator pods
oc get pods -n nvidia-gpu-operator

# Check GPU resources on a specific node
oc describe node <gpu-node-name> | grep nvidia`}</CodeBlock>
                <p>
                  All operators should show a phase of "Succeeded" in the CSV output,
                  and the GPU operator pods should all be in a Running state.
                </p>
              </Expand>

              <MarkCompleteButton
                idx={4}
                completed={completedSteps.has(4)}
                onToggle={toggleComplete}
              />
            </StepSection>

            {/* ── Step 6: Deploy llm-d ── */}
            <StepSection stepIndex={5} stepRef={setStepRef(5)}>
              <p style={{ marginBottom: '16px' }}>
                Now we deploy the actual llm{NBSP_HYPHEN}d stack. This follows the
                Optimized Baseline well-lit path.
              </p>

              <CodeBlock>{`# Clone the llm-d repo
git clone https://github.com/llm-d/llm-d.git && cd llm-d
git checkout main

# Set environment variables
export NAMESPACE=llm-d
export GUIDE_NAME="optimized-baseline"
export GAIE_VERSION=v1.5.0
export ROUTER_CHART_VERSION=v0

# Install Gateway API CRDs
oc apply -k https://github.com/kubernetes-sigs/gateway-api-inference-extension/config/crd/?ref=\${GAIE_VERSION}

# Deploy the gateway provider (AgentGateway or Envoy)
helmfile apply -f guides/prereq/gateway-provider/agentgateway.helmfile.yaml

# Deploy model server (uses kustomize)
oc apply -k guides/\${GUIDE_NAME}/modelserver/gpu/vllm/base/

# Deploy the router
oc apply -k guides/\${GUIDE_NAME}/router/

# Wait for pods to be ready
oc get pods -n $NAMESPACE -w`}</CodeBlock>

              <Expand label="What if I do not have helmfile?">
                <p style={{ marginBottom: '8px' }}>
                  Install <Code>helmfile</Code> using one of these methods:
                </p>
                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>macOS (Homebrew):</strong>{' '}
                    <Code>brew install helmfile</Code>
                  </li>
                  <li>
                    <strong>All platforms:</strong> Download from{' '}
                    <a
                      href="https://github.com/helmfile/helmfile/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: PURPLE, fontWeight: 600 }}
                    >
                      github.com/helmfile/helmfile/releases
                    </a>
                    , extract, and place it on your PATH.
                  </li>
                </ul>
              </Expand>

              <MarkCompleteButton
                idx={5}
                completed={completedSteps.has(5)}
                onToggle={toggleComplete}
              />
            </StepSection>

            {/* ── Step 7: Test Your Deployment ── */}
            <StepSection stepIndex={6} stepRef={setStepRef(6)}>
              <p style={{ marginBottom: '8px' }}>
                Expose the gateway via an OpenShift Route and send a test request:
              </p>

              <CodeBlock>{`# Expose the gateway via OpenShift Route
oc create route passthrough inference-gateway \\
  --service=inference-gateway --port=443 -n $NAMESPACE

# Get the route URL
ROUTE=$(oc get route inference-gateway -n $NAMESPACE -o jsonpath='{.status.ingress[0].host}')
echo "Your endpoint: https://$ROUTE"

# Send a test request
curl -k -X POST https://$ROUTE/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "Qwen/Qwen3-32B",
    "messages": [{"role": "user", "content": "What is Kubernetes?"}],
    "max_tokens": 100
  }'`}</CodeBlock>

              <ul
                style={{
                  paddingLeft: '20px',
                  margin: '16px 0',
                  listStyleType: 'disc',
                }}
              >
                <li style={{ marginBottom: '8px' }}>
                  The <Code>-k</Code> flag skips TLS verification (the route uses a
                  self-signed cert by default).
                </li>
                <li style={{ marginBottom: '8px' }}>
                  You should see a JSON response with the model's output.
                </li>
                <li>
                  To check metrics:
                </li>
              </ul>

              <CodeBlock>{`curl -k https://$ROUTE/metrics | head -20`}</CodeBlock>

              <MarkCompleteButton
                idx={6}
                completed={completedSteps.has(6)}
                onToggle={toggleComplete}
              />
            </StepSection>

            {/* ── Step 8: Clean Up ── */}
            <StepSection stepIndex={7} stepRef={setStepRef(7)}>
              <CodeBlock>{`# Delete all llm-d resources
oc delete project llm-d

# The RHPDS cluster will auto-deprovision after your reservation expires`}</CodeBlock>

              <p style={{ marginTop: '12px' }}>
                That is it. Your RHPDS cluster will be automatically torn down when your
                reservation duration expires, so there is no risk of runaway costs.
              </p>

              <MarkCompleteButton
                idx={7}
                completed={completedSteps.has(7)}
                onToggle={toggleComplete}
              />
            </StepSection>

            {/* ── What to do next ── */}
            <div
              style={{
                marginTop: '48px',
                padding: '32px',
                backgroundColor: GRAY_50,
                borderRadius: '6px',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: '16px',
                }}
              >
                What to do next
              </h3>
              <ul
                style={{
                  listStyleType: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <li>
                  <Link
                    to="/configurator"
                    style={{
                      color: PURPLE,
                      fontWeight: 600,
                      fontSize: '17px',
                      fontFamily: 'var(--font-body)',
                      textDecoration: 'none',
                    }}
                  >
                    Deployment Configurator
                  </Link>
                  <span
                    style={{
                      color: GRAY_600,
                      fontSize: '15px',
                      marginLeft: '8px',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Customize your llm{NBSP_HYPHEN}d deployment options
                  </span>
                </li>
                <li>
                  <Link
                    to="/routing"
                    style={{
                      color: PURPLE,
                      fontWeight: 600,
                      fontSize: '17px',
                      fontFamily: 'var(--font-body)',
                      textDecoration: 'none',
                    }}
                  >
                    Routing Visualizer
                  </Link>
                  <span
                    style={{
                      color: GRAY_600,
                      fontSize: '15px',
                      marginLeft: '8px',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    See how routing policies distribute requests
                  </span>
                </li>
                <li>
                  <Link
                    to="/notebooks"
                    style={{
                      color: PURPLE,
                      fontWeight: 600,
                      fontSize: '17px',
                      fontFamily: 'var(--font-body)',
                      textDecoration: 'none',
                    }}
                  >
                    Jupyter Notebooks
                  </Link>
                  <span
                    style={{
                      color: GRAY_600,
                      fontSize: '15px',
                      marginLeft: '8px',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Hands-on tutorials you can run in your new cluster
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

/* ------------------------------------------------------------------ */
/*  Mark Complete Button                                               */
/* ------------------------------------------------------------------ */

function MarkCompleteButton({
  idx,
  completed,
  onToggle,
}: {
  idx: number
  completed: boolean
  onToggle: (idx: number) => void
}) {
  return (
    <button
      onClick={() => onToggle(idx)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '24px',
        padding: '10px 20px',
        backgroundColor: completed ? '#E8F5E9' : '#fff',
        border: completed ? '1px solid #2E7D32' : `1px solid ${GRAY_100}`,
        borderRadius: '4px',
        cursor: 'pointer',
        fontFamily: 'var(--font-display)',
        fontSize: '14px',
        fontWeight: 600,
        color: completed ? '#2E7D32' : GRAY_600,
        transition: 'all 0.2s ease',
      }}
    >
      {completed ? (
        <>
          <Check style={{ width: '16px', height: '16px' }} />
          Completed
        </>
      ) : (
        'Mark as complete'
      )}
    </button>
  )
}
