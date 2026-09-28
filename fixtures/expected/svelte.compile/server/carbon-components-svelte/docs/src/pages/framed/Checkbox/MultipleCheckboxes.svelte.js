import * as $ from 'svelte/internal/server';
import { Button, Checkbox, Stack } from "carbon-components-svelte";

export default function MultipleCheckboxes($$renderer) {
	let values = ["Apple", "Banana", "Coconut"];
	let group = values.slice(0, 2);
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			inline: true,
			gap: 4,
			children: ($$renderer) => {
				$$renderer.push(`<div><!--[-->`);

				const each_array = $.ensure_array_like(values);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let value = each_array[$$index];

					Checkbox($$renderer, {
						labelText: value,
						value,
						get group() {
							return group;
						},

						set group($$value) {
							group = $$value;
							$$settled = false;
						}
					});
				}

				$$renderer.push(`<!--]--></div> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Set to ["Banana"]`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div><strong>Selected:</strong> ${$.escape(JSON.stringify(group))}</div>`);
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