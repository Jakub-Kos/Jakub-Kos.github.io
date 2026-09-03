// src/components/GraphVisualizer.tsx
import { onMount, createSignal, createMemo, For } from 'solid-js';
import ForceGraph from 'force-graph';

const TYPE_COLORS: Record<string, string> = {
    note: '#64748b',
    subject: '#2563eb',
    chapter: '#16a34a',
    talk: '#9333ea',
    video: '#dc2626',
    project: '#ea580c',
    thesis: '#0f172a',
    reference: '#0891b2',
    log: '#65a30d',
};
const GHOST_COLOR = '#94a3b8';

export default function GraphVisualizer(props: { data: { nodes: any[], links: any[] } }) {
    let containerRef!: HTMLDivElement;
    let graph: ReturnType<typeof ForceGraph>;

    const [typeFilter, setTypeFilter] = createSignal('all');
    const [search, setSearch] = createSignal('');

    const types = createMemo(() => {
        const found = new Set<string>();
        for (const n of props.data.nodes) {
            if (n.group !== 'ghost-page' && n.type) found.add(n.type);
        }
        return [...found].sort();
    });

    const matches = (node: any) => {
        const typeOk = typeFilter() === 'all' || node.type === typeFilter();
        const term = search().trim().toLowerCase();
        const searchOk = term === '' || String(node.id).toLowerCase().includes(term);
        return typeOk && searchOk;
    };

    onMount(() => {
        const rawData = JSON.parse(JSON.stringify(props.data));

        graph = ForceGraph()(containerRef)
            .graphData(rawData)
            .nodeId('id')

            // -- LINK STYLING --
            .linkColor(() => '#cbd5e1')
            .linkWidth(1.5)
            .linkDirectionalArrowLength(3.5)
            .linkDirectionalArrowColor(() => '#94a3b8')
            .linkDirectionalParticles(2)
            .linkDirectionalParticleWidth(1.5)
            .linkDirectionalParticleColor(() => '#64748b')
            .linkVisibility((link: any) => matches(link.source) || matches(link.target))

            .nodeVisibility(() => true)

            // -- CUSTOM NODE & TEXT RENDERING --
            .nodeCanvasObject((node: any, ctx, globalScale) => {
                const isGhost = node.group === 'ghost-page';
                const dimmed = !matches(node);
                const size = isGhost ? 3 : 6;
                const color = isGhost ? GHOST_COLOR : (TYPE_COLORS[node.type] ?? TYPE_COLORS.note);

                ctx.globalAlpha = dimmed ? 0.15 : 1;

                // 1. Draw the dot
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();

                // 2. Draw the text below the dot
                const label = node.id;
                const fontSize = 12 / globalScale; // Keeps text legible when zooming
                ctx.font = `${fontSize}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#0f172a';

                // Position the text slightly below the node
                ctx.fillText(label, node.x, node.y + size + 4);
                ctx.globalAlpha = 1;
            })

            // -- INTERACTION & NAVIGATION --
            .onNodeHover((node: any) => {
                // Change mouse to pointer (hand) if the node has a URL (is a real page)
                containerRef.style.cursor = node && node.url ? 'pointer' : 'default';
            })
            .onNodeClick((node: any) => {
                // Navigate to the page if it exists!
                if (node.url) {
                    window.location.href = node.url;
                }
            })
            .onNodeDragEnd((node: any) => {
                node.fx = node.x;
                node.fy = node.y;
            })

            .width(containerRef.clientWidth)
            .height(600);
    });

    return (
        <div>
            <div style={{ display: 'flex', gap: '0.75rem', "margin-bottom": '0.75rem', "flex-wrap": 'wrap', "align-items": 'center' }}>
                <input
                    type="text"
                    placeholder="Search nodes..."
                    value={search()}
                    onInput={(e) => { setSearch(e.currentTarget.value); graph?.refresh(); }}
                    style={{ padding: '0.4rem 0.6rem', "border-radius": '6px', border: '1px solid #cbd5e1', flex: '1', "min-width": '160px' }}
                />
                <select
                    value={typeFilter()}
                    onChange={(e) => { setTypeFilter(e.currentTarget.value); graph?.refresh(); }}
                    style={{ padding: '0.4rem 0.6rem', "border-radius": '6px', border: '1px solid #cbd5e1' }}
                >
                    <option value="all">All types</option>
                    <For each={types()}>{(t) => <option value={t}>{t}</option>}</For>
                </select>
            </div>
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '600px',
                    border: '1px solid #e2e8f0',
                    "border-radius": "12px",
                    overflow: "hidden",
                    "background-color": "#f8fafc",
                    "background-image": "radial-gradient(#cbd5e1 1px, transparent 1px)",
                    "background-size": "20px 20px"
                }}
            />
        </div>
    );
}
