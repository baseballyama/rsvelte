import * as $ from 'svelte/internal/server';
import { FloatingPortal } from "carbon-components-svelte";

export default function FloatingPortalFixture($$renderer) {
	let open = false;
	let anchor;

	$$renderer.push(`<button type="button" data-testid="toggle">Toggle</button> <div data-testid="anchor">Anchor element</div> `);

	FloatingPortal($$renderer, {
		anchor,
		open,
		direction: 'bottom',
		children: ($$renderer) => {
			$$renderer.push(`<span data-testid="floating-inner">Floating content</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}