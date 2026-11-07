import * as $ from 'svelte/internal/server';
import { CodeSnippet, Stack } from "carbon-components-svelte";

export default function CodeSnippetTooltipAlignment($$renderer) {
	Stack($$renderer, {
		gap: 6,
		children: ($$renderer) => {
			CodeSnippet($$renderer, { code: 'alignment: start', tooltipAlignment: 'start' });
			$$renderer.push(`<!----> `);
			CodeSnippet($$renderer, { code: 'alignment: center', tooltipAlignment: 'center' });
			$$renderer.push(`<!----> `);
			CodeSnippet($$renderer, { code: 'alignment: end', tooltipAlignment: 'end' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}