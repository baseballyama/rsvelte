import * as $ from 'svelte/internal/server';
import { FloatingPortal } from "carbon-components-svelte";

export default function FloatingPortalIntrinsicFixture($$renderer) {
	let open = false;
	let anchor;

	$$renderer.push(`<button type="button" data-testid="toggle">Toggle</button> <div data-testid="anchor" style="width: 320px;">Wide anchor</div> `);

	FloatingPortal($$renderer, {
		anchor,
		open,
		direction: 'bottom',
		intrinsicWidth: true,
		intrinsicAlign: 'start',
		children: ($$renderer) => {
			$$renderer.push(`<span data-testid="floating-inner">Intrinsic width content</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}