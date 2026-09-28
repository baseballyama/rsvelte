import * as $ from 'svelte/internal/server';
import { CodeSnippet, Stack } from "carbon-components-svelte";

export default function CodeSnippetPortalTooltip($$renderer) {
	let multiCode = "export function add(a, b) {\n  return a + b;\n}\n\nexport function subtract(a, b) {\n  return a - b;\n}";

	Stack($$renderer, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 200px;',
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			CodeSnippet($$renderer, {
				type: 'inline',
				code: 'rm -rf node_modules/',
				feedback: 'Copied!'
			});

			$$renderer.push(`<!----></div> `);
			CodeSnippet($$renderer, { code: 'npm i carbon-components-svelte', feedback: 'Copied!' });
			$$renderer.push(`<!----> `);
			CodeSnippet($$renderer, { type: 'multi', code: multiCode, feedback: 'Copied!' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}