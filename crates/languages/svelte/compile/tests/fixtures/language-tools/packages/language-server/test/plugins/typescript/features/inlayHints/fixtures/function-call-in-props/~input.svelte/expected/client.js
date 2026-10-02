import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteComponentTyped } from 'svelte';

export default function Input($$anchor) {
	let Component;

	function hi(name) {}

	{
		let $0 = $.derived(() => hi(''));

		Component($$anchor, {
			get text() {
				return $.get($0);
			}
		});
	}
}