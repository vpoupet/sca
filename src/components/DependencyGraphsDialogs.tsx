import { useEffect, useMemo, useRef, useState } from "react";
import {
    Background,
    Controls,
    MarkerType,
    useEdgesState,
    useNodesState,
    ReactFlow,
    type Edge,
    type Node,
} from "@xyflow/react";
import cytoscape, { type Core, type ElementDefinition } from "cytoscape";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";
import Automaton from "@/classes/Automaton";
import DirectedGraph from "@/classes/Graph";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Signal } from "@/types";

const nodeWidth = 180;
const radius = 280;

function makeSignalName(signal: Signal): string {
    return signal.description ?? "<unnamed signal>";
}

function buildGraphElements<T>(
    graph: DirectedGraph<T>,
    makeLabel: (vertex: T) => string
): { nodes: Node[]; edges: Edge[] } {
    const vertices = Array.from(graph.getVertices());
    const indexByVertex = new Map<T, number>();
    vertices.forEach((vertex, index) => {
        indexByVertex.set(vertex, index);
    });

    const vertexCount = Math.max(vertices.length, 1);
    const nodes: Node[] = vertices.map((vertex, index) => {
        const angle = (2 * Math.PI * index) / vertexCount;
        return {
            id: `node-${index}`,
            data: { label: makeLabel(vertex) },
            position: {
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
            },
            style: {
                width: nodeWidth,
                borderRadius: 12,
                padding: 8,
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                fontSize: 12,
                textAlign: "center",
                whiteSpace: "pre-wrap",
                lineHeight: 1.25,
            },
        };
    });

    const edges: Edge[] = graph.getEdges().map(([source, target], edgeIndex) => {
        const sourceIndex = indexByVertex.get(source);
        const targetIndex = indexByVertex.get(target);
        if (sourceIndex === undefined || targetIndex === undefined) {
            throw new Error("Could not map graph edge to React Flow node");
        }
        return {
            id: `edge-${edgeIndex}`,
            source: `node-${sourceIndex}`,
            target: `node-${targetIndex}`,
            animated: false,
        };
    });

    return { nodes, edges };
}

function buildCytoscapeElements<T>(
    graph: DirectedGraph<T>,
    makeLabel: (vertex: T) => string
): ElementDefinition[] {
    const vertices = Array.from(graph.getVertices());
    const indexByVertex = new Map<T, number>();

    vertices.forEach((vertex, index) => {
        indexByVertex.set(vertex, index);
    });

    const nodeElements: ElementDefinition[] = vertices.map((vertex, index) => ({
        data: {
            id: `node-${index}`,
            label: makeLabel(vertex),
        },
    }));

    const edgeElements: ElementDefinition[] = graph.getEdges().map(
        ([source, target], edgeIndex) => {
            const sourceIndex = indexByVertex.get(source);
            const targetIndex = indexByVertex.get(target);
            if (sourceIndex === undefined || targetIndex === undefined) {
                throw new Error("Could not map graph edge to Cytoscape node");
            }
            return {
                data: {
                    id: `edge-${edgeIndex}`,
                    source: `node-${sourceIndex}`,
                    target: `node-${targetIndex}`,
                },
            };
        }
    );

    return [...nodeElements, ...edgeElements];
}

function applyTopToBottomLayout(nodes: Node[], edges: Edge[]): Node[] {
    const g = new dagre.graphlib.Graph();
    g.setGraph({
        rankdir: "TB",
        nodesep: 40,
        ranksep: 100,
        marginx: 24,
        marginy: 24,
    });
    g.setDefaultEdgeLabel(() => ({}));

    for (const node of nodes) {
        const width = typeof node.style?.width === "number" ? node.style.width : nodeWidth;
        g.setNode(node.id, { width, height: 60 });
    }

    for (const edge of edges) {
        g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    return nodes.map((node) => {
        const position = g.node(node.id);
        if (!position) {
            return node;
        }
        const width = typeof node.style?.width === "number" ? node.style.width : nodeWidth;
        return {
            ...node,
            position: {
                x: position.x - width / 2,
                y: position.y - 30,
            },
        };
    });
}

function FlowPreview({
    title,
    description,
    nodes,
    edges,
}: {
    title: string;
    description: string;
    nodes: Node[];
    edges: Edge[];
}) {
    const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
    const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

    useEffect(() => {
        setFlowNodes(nodes);
    }, [nodes, setFlowNodes]);

    useEffect(() => {
        setFlowEdges(edges);
    }, [edges, setFlowEdges]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{title}</Button>
            </DialogTrigger>
            <DialogContent
                className="flex flex-col w-[90vw] h-[90vh] max-w-[90vw] sm:max-w-[90vw] p-0 gap-0"
                showCloseButton
            >
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex-1 min-h-0 h-full w-full p-6 pt-3">
                    <ReactFlow
                        className="graph-flow-no-handles"
                        fitView
                        nodes={flowNodes}
                        edges={flowEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        minZoom={0.15}
                        maxZoom={2}
                        defaultEdgeOptions={{
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 20,
                                height: 20,
                                color: "#334155",
                            },
                            style: {
                                stroke: "#334155",
                                strokeWidth: 1.5,
                            },
                        }}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Controls />
                        <Background gap={24} size={1.1} color="#e2e8f0" />
                    </ReactFlow>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CytoscapePreview({
    title,
    description,
    elements,
}: {
    title: string;
    description: string;
    elements: ElementDefinition[];
}) {
    const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const cyRef = useRef<Core | null>(null);
    const savedPositionsRef = useRef<Record<string, { x: number; y: number }>>({});

    const runAutomaticLayout = (cy: Core) => {
        const layout = cy.layout({
            name: "breadthfirst",
            directed: true,
            padding: 24,
            spacingFactor: 1.1,
            animate: false,
        });
        layout.run();
    };

    useEffect(() => {
        if (!open || !containerElement) {
            return;
        }

        const cy = cytoscape({
            container: containerElement,
            elements,
            style: [
                {
                    selector: "node",
                    style: {
                        label: "data(label)",
                        shape: "round-rectangle",
                        width: 180,
                        height: 52,
                        "text-wrap": "wrap",
                        "text-max-width": "160px",
                        "font-size": 12,
                        "text-valign": "center",
                        "text-halign": "center",
                        "background-color": "#ffffff",
                        "border-width": 1,
                        "border-color": "#cbd5e1",
                    },
                },
                {
                    selector: "edge",
                    style: {
                        width: 2.6,
                        "curve-style": "bezier",
                        "line-color": "#334155",
                        "target-arrow-color": "#334155",
                        "target-arrow-shape": "triangle",
                        "arrow-scale": 1.1,
                    },
                },
            ],
            wheelSensitivity: 0.25,
        });
        cyRef.current = cy;

        const fitGraph = () => {
            cy.resize();
            cy.fit(cy.elements(), 40);
        };

        const savedPositions = savedPositionsRef.current;
        let positionedNodes = 0;
        cy.nodes().forEach((node) => {
            const savedPosition = savedPositions[node.id()];
            if (savedPosition) {
                node.position(savedPosition);
                positionedNodes += 1;
            }
        });

        if (positionedNodes === cy.nodes().length && cy.nodes().length > 0) {
            fitGraph();
        } else {
            runAutomaticLayout(cy);
        }

        // Fit once immediately, then again after the dialog open animation settles.
        fitGraph();
        const rafId = requestAnimationFrame(fitGraph);
        const timeoutId = window.setTimeout(fitGraph, 220);

        return () => {
            const currentPositions: Record<string, { x: number; y: number }> = {};
            cy.nodes().forEach((node) => {
                currentPositions[node.id()] = { ...node.position() };
            });
            savedPositionsRef.current = currentPositions;

            cancelAnimationFrame(rafId);
            window.clearTimeout(timeoutId);
            cy.destroy();
            cyRef.current = null;
        };
    }, [containerElement, elements, open]);

    const resetLayout = () => {
        savedPositionsRef.current = {};
        const cy = cyRef.current;
        if (!cy) {
            return;
        }
        runAutomaticLayout(cy);
        cy.fit(cy.elements(), 40);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">{title}</Button>
            </DialogTrigger>
            <DialogContent
                className="flex flex-col w-[90vw] h-[90vh] max-w-[90vw] sm:max-w-[90vw] p-0 gap-0"
                showCloseButton
            >
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end px-6 pt-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={resetLayout}
                        disabled={elements.length === 0}
                    >
                        Reset layout
                    </Button>
                </div>
                <div className="flex-1 min-h-0 h-full w-full p-6 pt-3">
                    {elements.length === 0 ? (
                        <div className="flex h-full w-full items-center justify-center rounded-md border border-slate-200 bg-white text-sm text-slate-500">
                            No dependency graph to display yet. Add rules/signals first.
                        </div>
                    ) : (
                        <div
                            ref={setContainerElement}
                            className="h-full w-full rounded-md border border-slate-200 bg-white"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function DependencyGraphsDialogs({
    automaton,
}: {
    automaton: Automaton;
}) {
    const dependencyGraph = useMemo(() => automaton.makeDependencyGraph(), [automaton]);

    const dependencyCytoscapeElements = useMemo(
        () =>
            buildCytoscapeElements(dependencyGraph, (signal) =>
                makeSignalName(signal)
            ),
        [dependencyGraph]
    );

    const sccDag = useMemo(
        () => dependencyGraph.getGraphOfStronglyConnectedComponents(),
        [dependencyGraph]
    );

    const sccDagElements = useMemo(
        () =>
            buildGraphElements(sccDag, (component) => {
                const labels = Array.from(component)
                    .map((signal) => makeSignalName(signal))
                    .sort();
                return labels.join("\n");
            }),
        [sccDag]
    );

    const sccDagLayoutedNodes = useMemo(
        () => applyTopToBottomLayout(sccDagElements.nodes, sccDagElements.edges),
        [sccDagElements.nodes, sccDagElements.edges]
    );

    return (
        <div className="flex flex-wrap gap-2">
            <CytoscapePreview
                title="Show dependency graph"
                description="Directed graph of signal dependencies induced by all rules of the current automaton."
                elements={dependencyCytoscapeElements}
            />
            <FlowPreview
                title="Show SCC DAG"
                description="Directed acyclic graph of strongly connected components from the dependency graph."
                nodes={sccDagLayoutedNodes}
                edges={sccDagElements.edges}
            />
        </div>
    );
}
