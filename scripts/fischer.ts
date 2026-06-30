import Automaton from "../src/classes/Automaton";
import fs from "fs";

const rulesString = fs.readFileSync("../rules/fischer.txt", "utf-8");
const automaton = Automaton.newFromString(rulesString);

const graph = automaton.makeDependencyGraph();
console.log("Components of the dependency graph:", graph.getStronglyConnectedComponents());
console.log("Graph of SCC:", graph.getGraphOfStronglyConnectedComponents());