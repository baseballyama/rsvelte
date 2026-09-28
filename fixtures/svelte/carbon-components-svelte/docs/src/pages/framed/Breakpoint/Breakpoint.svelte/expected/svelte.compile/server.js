import * as $ from 'svelte/internal/server';
import { Breakpoint, Stack } from "carbon-components-svelte";

export default function Breakpoint_1($$renderer) {
	let size;
	let events = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				Breakpoint($$renderer, {
					get size() {
						return size;
					},

					set size($$value) {
						size = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <p>Resize the width of your browser.</p> <div><h6>Breakpoint size</h6> <h1>${$.escape(size)}</h1></div> <div><h6>on:change</h6> <pre>${$.escape(JSON.stringify(events, null, 2))}</pre></div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}