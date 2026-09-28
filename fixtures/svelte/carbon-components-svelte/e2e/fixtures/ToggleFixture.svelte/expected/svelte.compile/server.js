import * as $ from 'svelte/internal/server';
import { Toggle } from "carbon-components-svelte";

export default function ToggleFixture($$renderer) {
	let toggled = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Toggle($$renderer, {
			'data-testid': 'toggle-notifications',
			labelText: 'Enable notifications',
			get toggled() {
				return toggled;
			},

			set toggled($$value) {
				toggled = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Toggle($$renderer, {
			'data-testid': 'toggle-disabled',
			labelText: 'Disabled toggle',
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