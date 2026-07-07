@preprocessor typescript
@preprocessor module

@{%
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
    identifier: /[a-zA-Z_$][a-zA-Z_$0-9\-→,/]*/,
});
lexer.next = (next => () => {
    let tok;
    do {
        tok = next.call(lexer);
    } while(tok && ["ws", "comment"].includes(tok.type));
    return tok;
})(lexer.next);

%}
@builtin "string.ne"
@lexer lexer

LINES -> LINE | LINES %newline LINE {% ([lines, , line]) => [...lines, line] %}

LINE -> EMPTY_LINE
LINE -> RULE_LINE {% id %}
LINE -> MULTISIGNAL_LINE {% id %}
LINE -> FUNCTION_BEGIN_LINE {% id %}
LINE -> FUNCTION_END_LINE {% id %}

EMPTY_LINE -> INDENT {% () => ({ type: "empty_line" }) %}

RULE_LINE -> INDENT CLAUSE ":" {% ([indent, clause, ]) => ({
    type: "rule_line",
    indent: indent,
    condition: clause,
    outputs: undefined,
}) %}
RULE_LINE -> INDENT CLAUSE ":" OUTPUTS_LIST {% ([indent, clause, , outputs]) => ({
    type: "rule_line",
    indent: indent,
    condition: clause,
    outputs: outputs,
}) %}
RULE_LINE -> INDENT OUTPUTS_LIST {% ([indent, outputs, ]) => ({
    type: "rule_line",
    indent: indent,
    condition: undefined,
    outputs: outputs,
}) %}
INDENT -> %indent:? {% ([indent]) => {
    if (indent) {
        return indent.value.length;
    }
    return 0;
} %}

CLAUSE -> LITERAL {% id %}
CLAUSE -> CONJUNCTION {% id %}
CLAUSE -> DISJUNCTION {% id %}
CLAUSE -> NEGATION {% id %}
CLAUSES_LIST -> CLAUSE | CLAUSES_LIST CLAUSE {% ([list, c]) => [...list, c] %}
CONJUNCTION -> "(" ")" {% () => new Conjunction([]) %}
CONJUNCTION -> "(" CLAUSES_LIST ")" {% ([ , list, ]) => new Conjunction(list) %}
DISJUNCTION -> "[" "]" {% () => new Disjunction([]) %}
DISJUNCTION -> "[" CLAUSES_LIST "]" {% ([ , list, ]) => new Disjunction(list) %}
NEGATION -> "!" CLAUSE {%
([_, c]) => {
    if (c instanceof Literal) {
        return c.negated();
    } else if (c instanceof Negation) {
        return c.subclause;
    } else {
        return new Negation(c);
    }
}
%}

POSITION_LIST -> null {% () => [] %}
POSITION_LIST -> INT {% ([n]) => [n] %}
POSITION_LIST -> INT "," POSITION_LIST {% ([n, , rest]) => [n, ...rest] %}

SIGNAL_NAME -> IDENTIFIER {% id %}

LITERAL -> POSITION_LIST "." "!":? SIGNAL_NAME
   {% ([coords, , bang, s]) =>
        new Literal(Symbol.for(s), new Vector(coords), bang ? false : true) %}
LITERAL -> SIGNAL_NAME
   {% ([s]) =>
        new Literal(Symbol.for(s), new Vector(), true) %}

OUTPUT -> SIGNAL_NAME
   {% ([s]) => new RuleOutput(Symbol.for(s), new Vector([]), 1) %}
OUTPUT -> POSITION_LIST "." SIGNAL_NAME
   {% ([pos, , s]) => new RuleOutput(Symbol.for(s), new Vector(pos), 1) %}
OUTPUT -> "/" INT "." SIGNAL_NAME
   {% ([, step, , s]) => new RuleOutput(Symbol.for(s), new Vector([]), step) %}
OUTPUT -> POSITION_LIST "/" INT "." SIGNAL_NAME
   {% ([pos, , step, , s]) =>
        new RuleOutput(Symbol.for(s), new Vector(pos), step) %}
OUTPUTS_LIST -> OUTPUT | OUTPUTS_LIST OUTPUT {% ([list, o]) => [...list, o] %}

MULTISIGNAL_LINE -> INDENT SIGNAL_NAME "=" SIGNAL_VALUES {% ([indent, multiSignalName, , values]) => ({
    type: "multi_signal",
    indent: indent,
    signal: Symbol.for(multiSignalName),
    values: values,
}) %}
SIGNAL_VALUES -> SIGNAL | SIGNAL_VALUES SIGNAL {% ([list, s]) => [...list, s] %}
SIGNAL -> IDENTIFIER {% ([signalName]) => Symbol.for(signalName) %}

FUNCTION_BEGIN_LINE -> INDENT "@begin" FUNCTION_NAME "(" FUNC_PARAMETERS_LIST ")" {%
([indent, , functionName, , params]) => (
    {
        type: "begin_function",
        indent: indent,
        function_name: functionName,
        parameters: params,
    }
) %}
FUNCTION_NAME -> IDENTIFIER {% id %}
FUNC_PARAMETERS_LIST -> null
FUNC_PARAMETERS_LIST -> FUNC_PARAMETER
FUNC_PARAMETERS_LIST -> FUNC_PARAMETERS_LIST "," FUNC_PARAMETER {% ([list, , p]) => [...list, p] %}
FUNC_PARAMETER -> STRING {% id %}
FUNC_PARAMETER -> INT {% id %}
FUNCTION_END_LINE -> INDENT "@end" {% ([indent, ]) => ({
    type: "end_function",
    indent: indent,
}) %}

IDENTIFIER -> %identifier {% getValue %}
INT -> %int {% getValue %}
STRING -> %dqstring {% getValue %}
