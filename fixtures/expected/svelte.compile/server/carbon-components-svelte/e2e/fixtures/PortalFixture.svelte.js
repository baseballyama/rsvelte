import * as $ from 'svelte/internal/server';
import { Portal } from "carbon-components-svelte";

export default function PortalFixture($$renderer) {
	$$renderer.push(`<div data-testid="source">`);

	Portal($$renderer, {
		'data-testid': 'portal-content',
		children: ($$renderer) => {
			$$renderer.push(`<span data-testid="portal-inner">Portal content</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}