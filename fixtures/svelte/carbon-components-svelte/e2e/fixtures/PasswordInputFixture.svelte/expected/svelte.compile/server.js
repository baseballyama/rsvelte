import * as $ from 'svelte/internal/server';
import { PasswordInput } from "carbon-components-svelte";

export default function PasswordInputFixture($$renderer) {
	let value = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		PasswordInput($$renderer, {
			'data-testid': 'password-input',
			labelText: 'Password',
			placeholder: 'Enter password',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}