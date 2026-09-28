import * as $ from 'svelte/internal/server';
import { RadioTile, TileGroup } from "carbon-components-svelte";

export default function RadioTileReactiveOneWay($$renderer) {
	const values = ["Lite plan", "Standard plan", "Plus plan"];
	let selected = values[1];

	TileGroup($$renderer, {
		legendText: 'Service pricing tiers',
		name: 'plan',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(values);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let value = each_array[$$index];

				RadioTile($$renderer, {
					value,
					checked: selected === value,
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

	$$renderer.push(`<!----> <br/> Selected: <strong>${$.escape(selected)}</strong>`);
}