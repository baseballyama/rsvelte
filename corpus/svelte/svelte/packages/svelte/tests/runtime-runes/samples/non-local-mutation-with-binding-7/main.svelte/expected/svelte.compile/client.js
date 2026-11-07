import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component1 from './Component1.svelte';

export default function Main($$anchor) {
	let rows = $.state($.proxy([{}]));

	Component1($$anchor, {
		get rows() {
			return $.get(rows);
		},

		set rows($$value) {
			$.set(rows, $$value, true);
		}
	});
}