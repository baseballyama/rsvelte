import * as $ from 'svelte/internal/server';
import { Tooltip } from "carbon-components-svelte";

export default function TooltipFixture($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button" data-testid="toggle">Toggle tooltip</button> `);

		Tooltip($$renderer, {
			'data-testid': 'tooltip-wrapper',
			enterDelayMs: 0,
			leaveDelayMs: 0,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<span data-testid="tooltip-content">Tooltip content</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}