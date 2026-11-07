import * as $ from 'svelte/internal/server';
import { Disclosure, Stack } from "carbon-components-svelte";

export default function ReactiveDisclosure($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				$$renderer.push(`<div>Open: <strong>${$.escape(open)}</strong></div> `);

				Disclosure($$renderer, {
					summary: 'Show shipping details',
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<p>Orders ship within 2 business days and arrive in 3-5 business days.</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
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