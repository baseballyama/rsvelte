import * as $ from 'svelte/internal/server';
import { CodeSnippet, Stack } from "carbon-components-svelte";

export default function CodeSnippetTooltipPosition($$renderer) {
	Stack($$renderer, {
		gap: 6,
		children: ($$renderer) => {
			CodeSnippet($$renderer, { code: 'position: top', tooltipPosition: 'top' });
			$$renderer.push(`<!----> `);
			CodeSnippet($$renderer, { code: 'position: right', tooltipPosition: 'right' });
			$$renderer.push(`<!----> `);
			CodeSnippet($$renderer, { code: 'position: bottom', tooltipPosition: 'bottom' });
			$$renderer.push(`<!----> `);
			CodeSnippet($$renderer, { code: 'position: left', tooltipPosition: 'left' });
			$$renderer.push(`<!----> `);
			CodeSnippet($$renderer, { type: 'inline', code: 'inline', tooltipPosition: 'right' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}