import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'
import { riskBand } from '../lib/colorTokens'

cytoscape.use(coseBilkent)

function clamp01(n) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function bandColor(band) {
  if (band === 'high') return 'rgba(239, 68, 68, 0.85)'
  if (band === 'medium') return 'rgba(245, 158, 11, 0.85)'
  return 'rgba(34, 197, 94, 0.85)'
}

function toElements(graph) {
  const nodes = (graph?.nodes || []).map((n) => {
    const score = clamp01(n.risk_score ?? n.risk)
    const owners = Array.isArray(n.owners) ? n.owners : []
    const topOwners = [...owners]
      .filter((o) => o && typeof o.name === 'string')
      .sort((a, b) => (b.share ?? 0) - (a.share ?? 0))
      .slice(0, 4)

    // Precompute ring slices (Cytoscape pie) for a premium "ownership ring".
    const slices = topOwners.map((o) => clamp01(o.share ?? o.ownership ?? 0))
    const sliceSum = slices.reduce((s, x) => s + x, 0)
    const normalized = sliceSum > 0 ? slices.map((x) => x / sliceSum) : []

    const pie = {}
    normalized.forEach((p, idx) => {
      pie[`pie-${idx + 1}-background-size`] = `${Math.round(p * 100)}%`
    })

    // Deterministic owner palette (muted) to avoid random colors.
    const ownerPalette = [
      'rgba(124, 58, 237, 0.65)',
      'rgba(37, 99, 235, 0.55)',
      'rgba(147, 197, 253, 0.45)',
      'rgba(167, 139, 250, 0.45)'
    ]
    topOwners.forEach((_, idx) => {
      pie[`pie-${idx + 1}-background-color`] = ownerPalette[idx % ownerPalette.length]
      pie[`pie-${idx + 1}-background-opacity`] = 1
    })

    const band = riskBand(score)
    return {
      data: {
        id: String(n.id),
        label: n.label || n.name || String(n.id),
        risk: score,
        band,
        owners: topOwners
      },
      style: {
        'border-color': bandColor(band),
        ...pie
      }
    }
  })

  const edges = (graph?.edges || []).map((e, idx) => ({
    data: {
      id: e.id || `e${idx}`,
      source: String(e.source),
      target: String(e.target),
      weight: e.weight ?? 1
    }
  }))

  return [...nodes, ...edges]
}

export default function GraphView({
  graph,
  selectedNodeId,
  onSelectNode
}) {
  const containerRef = useRef(null)
  const cyRef = useRef(null)
  const [ready, setReady] = useState(false)

  const elements = useMemo(() => toElements(graph), [graph])

  useEffect(() => {
    if (!containerRef.current) return
    if (cyRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'rgba(18, 18, 26, 0.95)',
            'border-width': 2,
            'border-color': 'rgba(124, 58, 237, 0.55)',
            'label': 'data(label)',
            'color': '#e5e7eb',
            'font-size': 10,
            'text-wrap': 'wrap',
            'text-max-width': 100,
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 70,
            'height': 70,
            'padding': 6,
            'pie-size': '92%'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': 'rgba(148, 163, 184, 0.25)',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'rgba(148, 163, 184, 0.25)',
            'arrow-scale': 0.7
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': 'rgba(124, 58, 237, 0.95)',
            'color': '#ffffff'
          }
        },
        {
          selector: '.dim',
          style: {
            'opacity': 0.25
          }
        }
      ],
      layout: {
        name: 'cose-bilkent',
        animate: false,
        fit: true,
        padding: 30,
        nodeRepulsion: 4500,
        idealEdgeLength: 110
      },
      wheelSensitivity: 0.2
    })

    cy.on('tap', 'node', (evt) => {
      const id = evt.target.id()
      onSelectNode?.(id)
    })
    cy.on('tap', (evt) => {
      if (evt.target === cy) onSelectNode?.(null)
    })

    cyRef.current = cy
    setReady(true)

    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, [onSelectNode])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.elements().remove()
    cy.add(elements)

    const layout = cy.layout({
      name: 'cose-bilkent',
      animate: false,
      fit: true,
      padding: 30,
      nodeRepulsion: 4500,
      idealEdgeLength: 110
    })
    layout.run()
  }, [elements])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.nodes().unselect()
    if (selectedNodeId) {
      const node = cy.getElementById(String(selectedNodeId))
      if (node && node.length) node.select()
    }
  }, [selectedNodeId])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="glass-card rounded-2xl p-4 h-[520px]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-gray-200">Knowledge Graph</h3>
          <p className="text-xs text-gray-500 mt-1">Modules, dependencies, ownership rings</p>
        </div>
        <div className="text-xs font-mono text-gray-500">{ready ? 'interactive' : 'booting'}</div>
      </div>
      <div ref={containerRef} className="mt-3 h-[450px] w-full rounded-xl overflow-hidden border border-dark-border bg-dark-bg" />
    </motion.div>
  )
}
