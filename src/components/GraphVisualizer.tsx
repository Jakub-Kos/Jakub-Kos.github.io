// src/components/GraphVisualizer.tsx
import { onMount } from 'solid-js';
import ForceGraph from 'force-graph';

export default function GraphVisualizer(props: { data: { nodes: any[], links: any[] } }) {
    let containerRef!: HTMLDivElement;

    onMount(() => {
        const rawData = JSON.parse(JSON.stringify(props.data));

        const graph = ForceGraph()(containerRef)
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

            // -- CUSTOM NODE & TEXT RENDERING --
            .nodeCanvasObject((node: any, ctx, globalScale) => {
                const isGhost = node.group === 'ghost-page';
                const size = isGhost ? 3 : 6;
                const color = isGhost ? '#94a3b8' : '#0f172a';

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
                ctx.fillStyle = color;

                // Position the text slightly below the node
                ctx.fillText(label, node.x, node.y + size + 4);
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
    );
}