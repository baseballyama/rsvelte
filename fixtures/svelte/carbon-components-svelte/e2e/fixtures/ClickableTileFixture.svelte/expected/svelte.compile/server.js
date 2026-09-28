import * as $ from 'svelte/internal/server';
import { ClickableTile } from "carbon-components-svelte";

export default function ClickableTileFixture($$renderer) {
	let clicked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ClickableTile($$renderer, {
			'data-testid': 'clickable-tile',
			get clicked() {
				return clicked;
			},

			set clicked($$value) {
				clicked = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Clickable tile content`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div data-testid="clicked-state">${$.escape(clicked)}</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}