import {
    HighlightStyle,
    StreamLanguage,
    syntaxHighlighting,
    type StreamParser,
} from "@codemirror/language";
import { EditorView } from "codemirror";
import { tags as t, Tag } from "@lezer/highlight";

const signalTag = Tag.define();
const directiveTag = Tag.define();

type RuleLanguageState = Record<string, never>;

const ruleParser: StreamParser<RuleLanguageState> = {
    name: "automata-rules",
    startState: () => ({}),
    token(stream) {
        if (stream.eatSpace()) {
            return null;
        }

        if (stream.match(/#[^\n]*/)) {
            return "comment";
        }

        if (stream.match(/"(?:\\["\\]|[^"\\])*"/)) {
            return "string";
        }

        if (stream.match(/@(?:begin|end)\b/)) {
            return "directive";
        }

        if (stream.match(/[+-]?[0-9]+/)) {
            return "number";
        }

        if (stream.match(/[()[\]{}]/)) {
            return "bracket";
        }

        if (stream.match(/[.:=,]/)) {
            return "punctuation";
        }

        if (stream.match(/[!/]/)) {
            return "operator";
        }

        if (stream.match(/[a-zA-Z_$][a-zA-Z_$0-9\-→,/]*/)) {
            return "signal";
        }

        stream.next();
        return null;
    },
    tokenTable: {
        signal: signalTag,
        directive: directiveTag,
    },
};

export const ruleLanguage = StreamLanguage.define(ruleParser);

const ruleHighlightStyle = HighlightStyle.define([
    { tag: t.comment, color: "#6b7280", fontStyle: "italic" },
    { tag: t.string, color: "#a15c00" },
    { tag: t.number, color: "#7c3aed" },
    { tag: t.operator, color: "#b91c1c", fontWeight: "600" },
    { tag: t.punctuation, color: "#334155" },
    { tag: t.bracket, color: "#0f766e", fontWeight: "600" },
    { tag: signalTag, color: "#075985" },
    { tag: directiveTag, color: "#9333ea", fontWeight: "700" },
]);

export const ruleSyntaxHighlighting = syntaxHighlighting(ruleHighlightStyle);

export const ruleEditorTheme = EditorView.theme({
    "&": {
        fontSize: "0.875rem",
    },
    ".cm-content": {
        padding: "0.5rem",
        fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    ".cm-scroller": {
        fontFamily: "inherit",
    },
    ".cm-placeholder": {
        color: "#9ca3af",
    },
    "&.cm-focused": {
        outline: "none",
    },
});
