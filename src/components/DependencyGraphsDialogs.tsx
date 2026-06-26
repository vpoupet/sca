import { useEffect, useMemo } from "react";
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

export default function DependencyGraphsDialogs({
    automaton,
}: {
    automaton: Automaton;
}) {
    const dependencyGraph = useMemo(() => automaton.makeDependencyGraph(), [automaton]);

    const dependencyElements = useMemo(
        () =>
            buildGraphElements(dependencyGraph, (signal) =>
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
            <FlowPreview
                title="Show dependency graph"
                description="Directed graph of signal dependencies induced by all rules of the current automaton."
                nodes={dependencyElements.nodes}
                edges={dependencyElements.edges}
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
