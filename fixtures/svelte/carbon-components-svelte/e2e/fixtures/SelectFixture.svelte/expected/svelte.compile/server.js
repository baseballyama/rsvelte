import * as $ from 'svelte/internal/server';
import { Select, SelectItem } from "carbon-components-svelte";

export default function SelectFixture($$renderer) {
	let selected = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Select($$renderer, {
			'data-testid': 'select-country',
			labelText: 'Country',
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				SelectItem($$renderer, { value: 'us', text: 'United States' });
				$$renderer.push(`<!----> `);
				SelectItem($$renderer, { value: 'uk', text: 'United Kingdom' });
				$$renderer.push(`<!----> `);
				SelectItem($$renderer, { value: 'ca', text: 'Canada' });
				$$renderer.push(`<!----> `);
				SelectItem($$renderer, { value: 'de', text: 'Germany' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (selected) {
			$$renderer.push(`<!--[0--><p data-testid="selected-value">Selected: ${$.escape(selected)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}