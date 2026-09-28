import * as $ from 'svelte/internal/server';
import { RadioTile, TileGroup } from "carbon-components-svelte";

export default function RadioTileFixture($$renderer) {
	let selected = undefined;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TileGroup($$renderer, {
			'data-testid': 'radio-tile-group',
			legendText: 'Choose one',
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				RadioTile($$renderer, {
					value: 'a',
					'data-testid': 'radio-tile-a',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Option A`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				RadioTile($$renderer, {
					value: 'b',
					'data-testid': 'radio-tile-b',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Option B`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div data-testid="selected-value">${$.escape(selected ?? "none")}</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}