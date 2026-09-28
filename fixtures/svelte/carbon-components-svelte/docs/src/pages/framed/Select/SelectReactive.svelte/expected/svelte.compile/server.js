import * as $ from 'svelte/internal/server';
import { Button, Select, SelectItem, Stack } from "carbon-components-svelte";

export default function SelectReactive($$renderer) {
	let selected = "g10";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				Select($$renderer, {
					labelText: 'Carbon theme',
					helperText: `Selected: ${$.stringify(selected)}`,
					get selected() {
						return selected;
					},

					set selected($$value) {
						selected = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						SelectItem($$renderer, { value: 'white', text: 'White' });
						$$renderer.push(`<!----> `);
						SelectItem($$renderer, { value: 'g10', text: 'Gray 10' });
						$$renderer.push(`<!----> `);
						SelectItem($$renderer, { value: 'g80', text: 'Gray 80' });
						$$renderer.push(`<!----> `);
						SelectItem($$renderer, { value: 'g90', text: 'Gray 90' });
						$$renderer.push(`<!----> `);
						SelectItem($$renderer, { value: 'g100', text: 'Gray 100' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					kind: 'tertiary',
					size: 'small',
					disabled: selected === "g90",
					children: ($$renderer) => {
						$$renderer.push(`<!---->Set to "g90"`);
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