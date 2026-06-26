export default class DirectedGraph<T> {
    private vertices: Set<T>;
    private edges: Map<T, Set<T>>;
    private reverseEdges: Map<T, Set<T>>;

    constructor() {
        this.vertices = new Set();
        this.edges = new Map();
        this.reverseEdges = new Map();
    }

    addVertex(vertex: T) {
        if (!this.vertices.has(vertex)) {
            this.vertices.add(vertex);
            this.edges.set(vertex, new Set());
            this.reverseEdges.set(vertex, new Set());
        }
    }

    addEdge(vertex1: T, vertex2: T) {
        this.edges.get(vertex1)!.add(vertex2);
        this.reverseEdges.get(vertex2)!.add(vertex1);
    }

    getSuccessors(vertex: T): Set<T> {
        return this.edges.get(vertex)!;
    }

    getPredecessors(vertex: T): Set<T> {
        return this.reverseEdges.get(vertex)!;
    }

    getVertices(): Set<T> {
        return new Set(this.vertices);
    }

    getEdges(): Array<[T, T]> {
        const edgeList: Array<[T, T]> = [];
        for (const source of this.vertices) {
            for (const target of this.getSuccessors(source)) {
                edgeList.push([source, target]);
            }
        }
        return edgeList;
    }

    private computeStronglyConnectedComponents(): {
        components: Set<Set<T>>,
        componentOfVertex: Map<T, Set<T>>,
    } {
        const stack: T[] = [];
        const components: Set<Set<T>> = new Set();
        const componentOfVertex = new Map<T, Set<T>>();
        
        const unvisitedVertices = new Set(this.vertices);
        const visit = (u: T) => {
            if (unvisitedVertices.has(u)) {
                unvisitedVertices.delete(u);
                for (const v of this.getSuccessors(u)) {
                    visit(v);
                }
                stack.unshift(u);
            }
        }
        for (const u of this.vertices) {
            visit(u);
        }

        const unassignedVertices = new Set(this.vertices);
        const assign = (u: T, component: Set<T>) => {
            if (unassignedVertices.has(u)) {
                component.add(u);
                componentOfVertex.set(u, component);
                unassignedVertices.delete(u);
                for (const v of this.getPredecessors(u)) {
                    assign(v, component);
                }
            }
        }
        for (const u of stack) {
            if (unassignedVertices.has(u)) {
                const component: Set<T> = new Set();
                components.add(component);
                assign(u, component);
            }
        }
        return { components, componentOfVertex };
    }

    getStronglyConnectedComponents(): Set<Set<T>> {
        const { components } = this.computeStronglyConnectedComponents();
        return components;
    }

    getGraphOfStronglyConnectedComponents(): DirectedGraph<Set<T>> {
        const { components, componentOfVertex } = this.computeStronglyConnectedComponents();
        const componentGraph = new DirectedGraph<Set<T>>();
        for (const component of components) {
            componentGraph.addVertex(component);
        }
        for (const vertex of this.vertices) {
            const component = componentOfVertex.get(vertex)!;
            for (const successor of this.getSuccessors(vertex)) {
                const successorComponent = componentOfVertex.get(successor)!;
                if (successorComponent !== component) {
                    componentGraph.addEdge(component, successorComponent);
                }
            }
        }
        return componentGraph;
    }
}
