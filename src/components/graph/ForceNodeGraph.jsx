import React, { useEffect, useRef, useContext, useCallback } from 'react'
import * as d3 from 'd3'
import { AppContext } from '../../App'

/* Color by spend ratio */
function nodeColor(node, income) {
    const allocated = income * (node.percent / 100)
    const spent = node.spent || 0
    const ratio = allocated > 0 ? spent / allocated : 0
    if (ratio >= 0.95) return 'var(--red)'
    if (ratio >= 0.75) return 'var(--yellow)'
    return 'var(--border-bright)'
}

export default function ForceNodeGraph({ onNodeClick, selectedNodeId }) {
    const { nodes, income } = useContext(AppContext)
    const svgRef = useRef(null)
    const simRef = useRef(null)

    const draw = useCallback(() => {
        if (!svgRef.current || !nodes.length) return
        const svg = d3.select(svgRef.current)
        svg.selectAll('*').remove()

        const W = svgRef.current.clientWidth || 800
        const H = svgRef.current.clientHeight || 440

        // ── Defs: glow filters ──────────────────────────────────────────────
        const defs = svg.append('defs')
        nodes.forEach(n => {
            const col = nodeColor(n, income)
            const f = defs.append('filter').attr('id', `glow-${n.id}`)
            f.append('feGaussianBlur').attr('stdDeviation', '5').attr('result', 'blur')
            const merge = f.append('feMerge')
            merge.append('feMergeNode').attr('in', 'blur')
            merge.append('feMergeNode').attr('in', 'SourceGraphic')
        })

        // ── Force graph data ─────────────────────────────────────────────────
        const total = nodes.reduce((s, n) => s + Math.max(0, n.percent), 0)
        const centerNode = { id: '__center__', fx: W / 2, fy: H / 2, r: 52, isCenter: true }
        const allNodes = [centerNode, ...nodes.map(n => ({ ...n, r: 32 + (n.percent / 100) * 38 }))]
        const links = nodes.map(n => ({ source: '__center__', target: n.id }))

        // ── Simulation ───────────────────────────────────────────────────────
        const sim = d3.forceSimulation(allNodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(d => 140 + d.target.r * 0.5).strength(0.6))
            .force('charge', d3.forceManyBody().strength(-320))
            .force('collision', d3.forceCollide().radius(d => d.r + 18).strength(0.85))
            .force('center', d3.forceCenter(W / 2, H / 2).strength(0.05))
            .force('x', d3.forceX(W / 2).strength(0.04))
            .force('y', d3.forceY(H / 2).strength(0.04))
        simRef.current = sim

        // ── Background decorations ───────────────────────────────────────────
        svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'var(--bg-deep)')

        // Subtle grid dots (terminal style)
        for (let x = 0; x < W; x += 40) {
            for (let y = 0; y < H; y += 40) {
                svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 0.5).attr('fill', 'var(--border-bright)').attr('opacity', 0.15)
            }
        }

        // ── Links (curved connections) ───────────────────────────────────────
        const linkGroup = svg.append('g').attr('class', 'links')
        const linkSel = linkGroup.selectAll('path').data(links).enter().append('path')
            .attr('fill', 'none')
            .attr('stroke', 'var(--border)')
            .attr('stroke-width', 1)
            .attr('opacity', 0.5)

        // ── Node groups ──────────────────────────────────────────────────────
        const nodeGroup = svg.append('g').attr('class', 'nodes')
        const nodeSel = nodeGroup.selectAll('g').data(allNodes).enter().append('g')
            .attr('class', 'node-g')
            .style('cursor', d => d.isCenter ? 'default' : 'pointer')
            .on('click', (event, d) => {
                if (!d.isCenter) { event.stopPropagation(); onNodeClick?.(d.id) }
            })
            .on('mouseenter', function (event, d) {
                if (d.isCenter) return
                d3.select(this).select('.node-circle')
                    .transition().duration(200)
                    .attr('r', d.r + 7)
                    .attr('filter', `url(#glow-${d.id})`)
                d3.select(this).select('.node-glow')
                    .transition().duration(200).attr('opacity', 0.45)
            })
            .on('mouseleave', function (event, d) {
                if (d.isCenter) return
                d3.select(this).select('.node-circle')
                    .transition().duration(200)
                    .attr('r', d.r)
                    .attr('filter', selectedNodeId === d.id ? `url(#glow-${d.id})` : 'none')
                d3.select(this).select('.node-glow')
                    .transition().duration(200).attr('opacity', selectedNodeId === d.id ? 0.3 : 0)
            })
            .call(
                d3.drag()
                    .filter(d => !d.isCenter)
                    .on('start', function (event, d) {
                        if (!event.active) sim.alphaTarget(0.3).restart()
                        d.fx = d.x; d.fy = d.y
                    })
                    .on('drag', function (event, d) {
                        d.fx = event.x; d.fy = event.y
                    })
                    .on('end', function (event, d) {
                        if (!event.active) sim.alphaTarget(0)
                        d.fx = null; d.fy = null
                    })
            )

        // Center node
        const centerG = nodeSel.filter(d => d.isCenter)
        centerG.append('circle').attr('r', 52).attr('fill', 'rgba(255,255,255,0.03)').attr('stroke', 'var(--border-bright)').attr('stroke-width', 1).attr('stroke-dasharray', '4 4')
        centerG.append('circle').attr('r', 44).attr('fill', 'var(--bg-card)').attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-width', 1).style('filter', 'drop-shadow(0 0 10px rgba(255,255,255,0.05))')

        centerG.append('text').attr('text-anchor', 'middle').attr('dy', '-0.5em').attr('fill', 'var(--text-muted)').attr('font-size', '10px').attr('font-weight', 600).attr('font-family', 'var(--font-main)').attr('letter-spacing', '0.1em').text('CAPITAL')
        centerG.append('text').attr('text-anchor', 'middle').attr('dy', '1.2em').attr('fill', 'var(--text-primary)').attr('font-size', '14px').attr('font-weight', 500).attr('font-family', 'var(--font-mono)').text(`₹${(income / 1000).toFixed(0)}K`)

        // Child nodes
        const childG = nodeSel.filter(d => !d.isCenter)
        childG.each(function (d) {
            const g = d3.select(this)
            const col = nodeColor(d, income)
            const allocated = income * (d.percent / 100)
            const spent = d.spent || 0
            const ratio = Math.min(1, allocated > 0 ? spent / allocated : 0)
            const isSelected = selectedNodeId === d.id

            // Glow halo
            g.append('circle').attr('class', 'node-glow')
                .attr('r', d.r + 14)
                .attr('fill', col)
                .attr('opacity', isSelected ? 0.3 : 0)
                .attr('filter', 'blur(10px)')

            // Main circle
            const gradId = `ng-${d.id}`
            const grad = defs.append('radialGradient').attr('id', gradId)
            const parsedColor = d3.color(col)
            const brightColor = parsedColor ? parsedColor.brighter(0.4).toString() : col
            grad.append('stop').attr('offset', '0%').attr('stop-color', brightColor)
            grad.append('stop').attr('offset', '100%').attr('stop-color', col)

            g.append('circle').attr('class', 'node-circle')
                .attr('r', d.r)
                .attr('fill', 'var(--bg-card)')
                .attr('stroke', isSelected ? 'var(--text-primary)' : 'var(--border-active)')
                .attr('stroke-width', isSelected ? 2 : 1)

            g.append('circle').attr('class', 'node-inner')
                .attr('r', d.r - 8)
                .attr('fill', 'rgba(255,255,255,0.02)')

            // Progress arc (spent indicator)
            if (ratio > 0) {
                const arc = d3.arc()
                    .innerRadius(d.r - 3)
                    .outerRadius(d.r - 0)
                    .startAngle(0)
                    .endAngle(ratio * 2 * Math.PI)
                g.append('path')
                    .attr('d', arc())
                    .attr('fill', ratio >= 0.95 ? 'var(--red)' : ratio >= 0.75 ? 'var(--yellow)' : 'var(--accent-indigo)')
                    .attr('opacity', 0.8)
            }

            // Labels
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '-0.1em')
                .attr('fill', 'var(--text-primary)')
                .attr('font-size', '12px')
                .attr('font-weight', 500)
                .attr('letter-spacing', '-0.02em')
                .attr('font-family', 'var(--font-main)')
                .text(d.name)

            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1.3em')
                .attr('fill', 'var(--text-muted)')
                .attr('font-size', '11px')
                .attr('font-family', 'var(--font-mono)')
                .text(`${d.percent}%`)
        })

        // ── Tick: update positions ───────────────────────────────────────────
        sim.on('tick', () => {
            linkSel.attr('d', d => {
                const sx = d.source.x, sy = d.source.y, tx = d.target.x, ty = d.target.y
                const mx = (sx + tx) / 2, my = (sy + ty) / 2 - 40
                return `M${sx},${sy} Q${mx},${my} ${tx},${ty}`
            })
            nodeSel.attr('transform', d => `translate(${Math.max(d.r + 10, Math.min(W - d.r - 10, d.x))},${Math.max(d.r + 10, Math.min(H - d.r - 10, d.y))})`
            )
        })

        // Calm simulation after initial layout
        setTimeout(() => sim.alpha(0.05).alphaDecay(0.05), 800)
    }, [nodes, income, selectedNodeId, onNodeClick])

    useEffect(() => { draw() }, [draw])

    // Cleanup on unmount
    useEffect(() => () => simRef.current?.stop(), [])

    return (
        <div className="card" style={{ height: 480, padding: 0, borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative', border: '1px solid var(--border)', background: 'var(--bg-deep)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>NODE GRAPH LIVE</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>[ OK ]</span>
            </div>
            {/* Legend */}
            <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10, display: 'flex', gap: 16, alignItems: 'center' }}>
                {[['#10b981', '< 75%'], ['#f59e0b', '75–95%'], ['#f43f5e', '> 95%']].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, filter: `drop-shadow(0 0 4px ${c})` }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{l}</span>
                    </div>
                ))}
            </div>
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
            {!nodes.length && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: '2.5rem' }}>🔮</div>
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No budget nodes yet</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add a node to visualize your budget</div>
                </div>
            )}
        </div>
    )
}
