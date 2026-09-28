import * as $ from 'svelte/internal/server';
import { Checkbox } from "carbon-components-svelte";

export default function CheckboxFixture($$renderer) {
	let checked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Checkbox($$renderer, {
			'data-testid': 'checkbox-agree',
			labelText: 'I agree to the terms',
			get checked() {
				return checked;
			},

			set checked($$value) {
				checked = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Checkbox($$renderer, {
			'data-testid': 'checkbox-disabled',
			labelText: 'Disabled option',
			disabled: true
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