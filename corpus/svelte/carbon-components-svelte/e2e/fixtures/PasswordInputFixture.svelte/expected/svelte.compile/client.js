import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PasswordInput } from "carbon-components-svelte";

export default function PasswordInputFixture($$anchor) {
	let value = "";

	PasswordInput($$anchor, {
		'data-testid': 'password-input',
		labelText: 'Password',
		placeholder: 'Enter password',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});
}