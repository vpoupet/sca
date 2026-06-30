// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }

import { Literal, Conjunction, Disjunction, Negation } from "../classes/Clause.ts";
import { RuleOutput } from "../classes/Rule.ts";
import Vector from "../classes/Vector.ts";
import moo from "moo";

function getValue(x) {
    return x[0].value;
}

const lexer = moo.compile({
    indent: /^[ \t]+/,
    ws: { match: /[ \t]+/},
    newline: { match: /[\n]+/, lineBreaks: true },
    dqstring: {match: /"(?:\\["\\]|[^"\\])*"/, value: x => x.slice(1, -1)},
    comment: /#[^\n]*/,
    begin_fun: "@begin",
    end_fun: "@end",
    int: {match: /[+-]?[0-9]+/, value: x => parseInt(x)},
    dot: ".",
    colon: ":",
    bang: "!",
    slash: "/",
    comma: ",",
    eq: "=",
    lb: "[",
    rb: "]",
    lp: "(",
    rp: ")",
    la: "{",
    ra: "}",
    at: "@",
    identifier: /[a-zA-Z_$][a-zA-Z_$0-9]*/,
});
lexer.next = (next => () => {
    let tok;
    do {
        tok = next.call(lexer);
    } while(tok && ["ws", "comment"].includes(tok.type));
    return tok;
})(lexer.next);

let Lexer = lexer;
let ParserRules = [
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", "dstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "sqstring$ebnf$1", "symbols": []},
    {"name": "sqstring$ebnf$1", "symbols": ["sqstring$ebnf$1", "sstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "sqstring", "symbols": [{"literal":"'"}, "sqstring$ebnf$1", {"literal":"'"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "btstring$ebnf$1", "symbols": []},
    {"name": "btstring$ebnf$1", "symbols": ["btstring$ebnf$1", /[^`]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "btstring", "symbols": [{"literal":"`"}, "btstring$ebnf$1", {"literal":"`"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "dstrchar", "symbols": [/[^\\"\n]/], "postprocess": id},
    {"name": "dstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": 
        function(d) {
            return JSON.parse("\""+d.join("")+"\"");
        }
        },
    {"name": "sstrchar", "symbols": [/[^\\'\n]/], "postprocess": id},
    {"name": "sstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": function(d) { return JSON.parse("\""+d.join("")+"\""); }},
    {"name": "sstrchar$string$1", "symbols": [{"literal":"\\"}, {"literal":"'"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "sstrchar", "symbols": ["sstrchar$string$1"], "postprocess": function(d) {return "'"; }},
    {"name": "strescape", "symbols": [/["\\/bfnrt]/], "postprocess": id},
    {"name": "strescape", "symbols": [{"literal":"u"}, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/], "postprocess": 
        function(d) {
            return d.join("");
        }
        },
    {"name": "LINES", "symbols": ["LINE"]},
    {"name": "LINES", "symbols": ["LINES", (lexer.has("newline") ? {type: "newline"} : newline), "LINE"], "postprocess": ([lines, , line]) => [...lines, line]},
    {"name": "LINE", "symbols": ["EMPTY_LINE"]},
    {"name": "LINE", "symbols": ["RULE_LINE"], "postprocess": id},
    {"name": "LINE", "symbols": ["MULTISIGNAL_LINE"], "postprocess": id},
    {"name": "LINE", "symbols": ["FUNCTION_BEGIN_LINE"], "postprocess": id},
    {"name": "LINE", "symbols": ["FUNCTION_END_LINE"], "postprocess": id},
    {"name": "EMPTY_LINE", "symbols": ["INDENT"], "postprocess": () => ({ type: "empty_line" })},
    {"name": "RULE_LINE", "symbols": ["INDENT", "CLAUSE", {"literal":":"}], "postprocess":  ([indent, clause, ]) => ({
            type: "rule_line",
            indent: indent,
            condition: clause,
            outputs: undefined,
        }) },
    {"name": "RULE_LINE", "symbols": ["INDENT", "CLAUSE", {"literal":":"}, "OUTPUTS_LIST"], "postprocess":  ([indent, clause, , outputs]) => ({
            type: "rule_line",
            indent: indent,
            condition: clause,
            outputs: outputs,
        }) },
    {"name": "RULE_LINE", "symbols": ["INDENT", "OUTPUTS_LIST"], "postprocess":  ([indent, outputs, ]) => ({
            type: "rule_line",
            indent: indent,
            condition: undefined,
            outputs: outputs,
        }) },
    {"name": "INDENT$ebnf$1", "symbols": [(lexer.has("indent") ? {type: "indent"} : indent)], "postprocess": id},
    {"name": "INDENT$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "INDENT", "symbols": ["INDENT$ebnf$1"], "postprocess":  ([indent]) => {
            if (indent) {
                return indent.value.length;
            }
            return 0;
        } },
    {"name": "CLAUSE", "symbols": ["LITERAL"], "postprocess": id},
    {"name": "CLAUSE", "symbols": ["CONJUNCTION"], "postprocess": id},
    {"name": "CLAUSE", "symbols": ["DISJUNCTION"], "postprocess": id},
    {"name": "CLAUSE", "symbols": ["NEGATION"], "postprocess": id},
    {"name": "CLAUSES_LIST", "symbols": ["CLAUSE"]},
    {"name": "CLAUSES_LIST", "symbols": ["CLAUSES_LIST", "CLAUSE"], "postprocess": ([list, c]) => [...list, c]},
    {"name": "CONJUNCTION", "symbols": [{"literal":"("}, {"literal":")"}], "postprocess": () => new Conjunction([])},
    {"name": "CONJUNCTION", "symbols": [{"literal":"("}, "CLAUSES_LIST", {"literal":")"}], "postprocess": ([ , list, ]) => new Conjunction(list)},
    {"name": "DISJUNCTION", "symbols": [{"literal":"["}, {"literal":"]"}], "postprocess": () => new Disjunction([])},
    {"name": "DISJUNCTION", "symbols": [{"literal":"["}, "CLAUSES_LIST", {"literal":"]"}], "postprocess": ([ , list, ]) => new Disjunction(list)},
    {"name": "NEGATION", "symbols": [{"literal":"!"}, "CLAUSE"], "postprocess": 
        ([_, c]) => {
            if (c instanceof Literal) {
                return c.negated();
            } else if (c instanceof Negation) {
                return c.subclause;
            } else {
                return new Negation(c);
            }
        }
        },
    {"name": "POSITION_LIST", "symbols": [], "postprocess": () => []},
    {"name": "POSITION_LIST", "symbols": ["INT"], "postprocess": ([n]) => [n]},
    {"name": "POSITION_LIST", "symbols": ["INT", {"literal":","}, "POSITION_LIST"], "postprocess": ([n, , rest]) => [n, ...rest]},
    {"name": "SIGNAL_NAME", "symbols": ["IDENTIFIER"], "postprocess": id},
    {"name": "LITERAL$ebnf$1", "symbols": [{"literal":"!"}], "postprocess": id},
    {"name": "LITERAL$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "LITERAL", "symbols": ["POSITION_LIST", {"literal":"."}, "LITERAL$ebnf$1", "SIGNAL_NAME"], "postprocess":  ([coords, , bang, s]) =>
        new Literal(Symbol.for(s), new Vector(coords), bang ? false : true) },
    {"name": "LITERAL", "symbols": ["SIGNAL_NAME"], "postprocess":  ([s]) =>
        new Literal(Symbol.for(s), new Vector(), true) },
    {"name": "OUTPUT", "symbols": ["SIGNAL_NAME"], "postprocess": ([s]) => new RuleOutput(new Vector([]), Symbol.for(s), 1)},
    {"name": "OUTPUT", "symbols": ["POSITION_LIST", {"literal":"."}, "SIGNAL_NAME"], "postprocess": ([pos, , s]) => new RuleOutput(new Vector(pos), Symbol.for(s), 1)},
    {"name": "OUTPUT", "symbols": [{"literal":"/"}, "INT", {"literal":"."}, "SIGNAL_NAME"], "postprocess": ([, step, , s]) => new RuleOutput(new Vector([]), Symbol.for(s), step)},
    {"name": "OUTPUT", "symbols": ["POSITION_LIST", {"literal":"/"}, "INT", {"literal":"."}, "SIGNAL_NAME"], "postprocess":  ([pos, , step, , s]) =>
        new RuleOutput(new Vector(pos), Symbol.for(s), step) },
    {"name": "OUTPUTS_LIST", "symbols": ["OUTPUT"]},
    {"name": "OUTPUTS_LIST", "symbols": ["OUTPUTS_LIST", "OUTPUT"], "postprocess": ([list, o]) => [...list, o]},
    {"name": "MULTISIGNAL_LINE", "symbols": ["INDENT", "SIGNAL_NAME", {"literal":"="}, "SIGNAL_VALUES"], "postprocess":  ([indent, multiSignalName, , values]) => ({
            type: "multi_signal",
            indent: indent,
            signal: Symbol.for(multiSignalName),
            values: values,
        }) },
    {"name": "SIGNAL_VALUES", "symbols": ["SIGNAL"]},
    {"name": "SIGNAL_VALUES", "symbols": ["SIGNAL_VALUES", "SIGNAL"], "postprocess": ([list, s]) => [...list, s]},
    {"name": "SIGNAL", "symbols": ["IDENTIFIER"], "postprocess": ([signalName]) => Symbol.for(signalName)},
    {"name": "FUNCTION_BEGIN_LINE", "symbols": ["INDENT", {"literal":"@begin"}, "FUNCTION_NAME", {"literal":"("}, "FUNC_PARAMETERS_LIST", {"literal":")"}], "postprocess": 
        ([indent, , functionName, , params]) => (
            {
                type: "begin_function",
                indent: indent,
                function_name: functionName,
                parameters: params,
            }
        ) },
    {"name": "FUNCTION_NAME", "symbols": ["IDENTIFIER"], "postprocess": id},
    {"name": "FUNC_PARAMETERS_LIST", "symbols": []},
    {"name": "FUNC_PARAMETERS_LIST", "symbols": ["FUNC_PARAMETER"]},
    {"name": "FUNC_PARAMETERS_LIST", "symbols": ["FUNC_PARAMETERS_LIST", {"literal":","}, "FUNC_PARAMETER"], "postprocess": ([list, , p]) => [...list, p]},
    {"name": "FUNC_PARAMETER", "symbols": ["STRING"], "postprocess": id},
    {"name": "FUNC_PARAMETER", "symbols": ["INT"], "postprocess": id},
    {"name": "FUNCTION_END_LINE", "symbols": ["INDENT", {"literal":"@end"}], "postprocess":  ([indent, ]) => ({
            type: "end_function",
            indent: indent,
        }) },
    {"name": "IDENTIFIER", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": getValue},
    {"name": "INT", "symbols": [(lexer.has("int") ? {type: "int"} : int)], "postprocess": getValue},
    {"name": "STRING", "symbols": [(lexer.has("dqstring") ? {type: "dqstring"} : dqstring)], "postprocess": getValue}
];
let ParserStart = "LINES";
export default { Lexer, ParserRules, ParserStart };
