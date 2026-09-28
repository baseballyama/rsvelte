import * as $ from 'svelte/internal/server';
import { Checkbox, CheckboxGroup } from "carbon-components-svelte";

export default function CheckboxGroupFixture($$renderer) {
	let selected = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		CheckboxGroup($$renderer, {
			'data-testid': 'checkbox-group-options',
			legendText: 'Choose options',
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Checkbox($$renderer, { value: 'a', labelText: 'Option A' });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { value: 'b', labelText: 'Option B' });
				$$renderer.push(`<!----> `);
				Checkbox($$renderer, { value: 'c', labelText: 'Option C' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (selected.length > 0) {
			$$renderer.push(`<!--[0--><p data-testid="selected-values">Selected: ${$.escape(selected.join(", "))}</p>`);
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