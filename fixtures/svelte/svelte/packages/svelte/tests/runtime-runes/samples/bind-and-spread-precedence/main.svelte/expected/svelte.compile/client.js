import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from './input.svelte';

export default function Main($$anchor) {
	let value = $.state('foo');
	const props = $.proxy({ value: 'bar' });

	Button($$anchor, $.spread_props(() => props, {
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	}));
}