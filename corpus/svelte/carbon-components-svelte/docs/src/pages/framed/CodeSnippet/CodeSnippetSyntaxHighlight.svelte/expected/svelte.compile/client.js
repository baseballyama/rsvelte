import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeSnippet } from "carbon-components-svelte";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";

export default function CodeSnippetSyntaxHighlight($$anchor, $$props) {
	$.push($$props, true);

	const code = `export function add(a: number, b: number) {
  return a + b;
}

export function subtract(a: number, b: number) {
  return a - b;
}`;

	const highlighted = Prism.highlight(code, Prism.languages.typescript, "typescript");

	CodeSnippet($$anchor, {
		type: 'multi',
		code,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.html(node, () => highlighted);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}