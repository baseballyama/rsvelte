import * as $ from 'svelte/internal/server';
import { SelectableTile, SelectableTileGroup } from "carbon-components-svelte";

export default function SelectableTileReactiveOneWay($$renderer) {
	const values = ["Lite plan", "Standard plan", "Plus plan"];
	let selected = [values[0], values[1]];

	SelectableTileGroup($$renderer, {
		legendText: 'Service pricing tiers',
		name: 'plan',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(values);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let value = each_array[$$index];

				SelectableTile($$renderer, {
					value,
					selected: selected.includes(value),
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

	$$renderer.push(`<!----> <br/> Selected: <strong>${$.escape(selected.join(", ") || "None")}</strong>`);
}