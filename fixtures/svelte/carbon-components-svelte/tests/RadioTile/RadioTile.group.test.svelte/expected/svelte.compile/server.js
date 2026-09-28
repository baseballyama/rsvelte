import * as $ from 'svelte/internal/server';
import Button from "carbon-components-svelte/Button/Button.svelte";
import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";
import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";

export default function RadioTile_group_test($$renderer) {
	const values = ["Lite plan", "Standard plan", "Plus plan"];
	let selected = values[1];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TileGroup($$renderer, {
			legendText: 'Service pricing tiers',
			name: 'plan',
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(values);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let value = each_array[$$index];

					RadioTile($$renderer, {
						value,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(value)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div>Selected: ${$.escape(selected)}</div> `);

		Button($$renderer, {
			size: 'small',
			disabled: selected === values[1],
			children: ($$renderer) => {
				$$renderer.push(`<!---->Set to "${$.escape(values[1])}"`);
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