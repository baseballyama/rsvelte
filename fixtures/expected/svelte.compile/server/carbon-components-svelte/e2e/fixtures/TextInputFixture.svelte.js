import * as $ from 'svelte/internal/server';
import { TextInput } from "carbon-components-svelte";

export default function TextInputFixture($$renderer) {
	let value = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextInput($$renderer, {
			'data-testid': 'text-input-username',
			labelText: 'User name',
			placeholder: 'Enter your name',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		TextInput($$renderer, {
			'data-testid': 'text-input-disabled',
			labelText: 'Disabled field',
			placeholder: 'Cannot edit',
			disabled: true
		});

		$$renderer.push(`<!----> `);

		TextInput($$renderer, {
			'data-testid': 'text-input-invalid',
			labelText: 'Invalid field',
			placeholder: 'Has error',
			invalid: true,
			invalidText: 'This field is required'
		});

		$$renderer.push(`<!----> <div data-testid="text-input-fluid-counter-case">`);

		TextInput($$renderer, {
			fluid: true,
			labelText: 'Nickname',
			maxCount: 10,
			value: 'abc'
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}