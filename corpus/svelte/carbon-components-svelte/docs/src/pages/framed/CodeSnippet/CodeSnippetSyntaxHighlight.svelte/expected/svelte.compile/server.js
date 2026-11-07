import * as $ from 'svelte/internal/server';
import { CodeSnippet } from "carbon-components-svelte";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";

export default function CodeSnippetSyntaxHighlight($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const code = `export function add(a: number, b: number) {
  return a + b;
}

export function subtract(a: number, b: number) {
  return a - b;
}`;

		const highlighted = Prism.highlight(code, Prism.languages.typescript, "typescript");

		CodeSnippet($$renderer, {
			type: 'multi',
			code,
			children: ($$renderer) => {
				$$renderer.push(`${$.html(highlighted)}`);
			},
			$$slots: { default: true }
		});
	});
}