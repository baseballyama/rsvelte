import * as $ from 'svelte/internal/server';
import { SelectableTile, SelectableTileGroup } from "carbon-components-svelte";

export default function SelectableTileFixture($$renderer) {
	let selected = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		SelectableTileGroup($$renderer, {
			'data-testid': 'selectable-tile-group',
			legendText: 'Choose one or more',
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				SelectableTile($$renderer, {
					value: 'x',
					'data-testid': 'selectable-tile-x',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Option X`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SelectableTile($$renderer, {
					value: 'y',
					'data-testid': 'selectable-tile-y',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Option Y`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div data-testid="selected-values">${$.escape(selected.join(",") || "none")}</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}