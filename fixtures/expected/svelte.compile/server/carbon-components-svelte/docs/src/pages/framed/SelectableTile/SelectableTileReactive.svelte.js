import * as $ from 'svelte/internal/server';
import { Button, SelectableTile, SelectableTileGroup, Stack } from "carbon-components-svelte";

export default function SelectableTileReactive($$renderer) {
	const values = ["Lite plan", "Standard plan", "Plus plan"];
	let selected = [values[0], values[1]];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				SelectableTileGroup($$renderer, {
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

							SelectableTile($$renderer, {
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

				$$renderer.push(`<!----> <div>Selected: <strong>${$.escape(selected.join(", ") || "None")}</strong></div> `);

				Button($$renderer, {
					size: 'small',
					disabled: selected.length === 1 && selected[0] === values[1],
					children: ($$renderer) => {
						$$renderer.push(`<!---->Set to "${$.escape(values[1])}" only`);
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