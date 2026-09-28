import * as $ from 'svelte/internal/server';
import { ClickableTile, Stack } from "carbon-components-svelte";

export default function ReactiveClickableTile($$renderer) {
	let clicked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				$$renderer.push(`<div>Clicked: <strong>${$.escape(clicked)}</strong></div> `);

				ClickableTile($$renderer, {
					get clicked() {
						return clicked;
					},

					set clicked($$value) {
						clicked = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Click this tile`);
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