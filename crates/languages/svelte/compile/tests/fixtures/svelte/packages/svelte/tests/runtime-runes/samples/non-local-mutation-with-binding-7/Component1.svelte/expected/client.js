import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component2 from './Component2.svelte';

export default function Component1($$anchor, $$props) {
	$.push($$props, true);

	let rows = $.prop($$props, 'rows', 27, () => $.proxy([]));
	let rows2 = $.state($.proxy([]));

	$.user_effect(() => {
		$.set(rows2, rows().slice(), true);
	});

	Component2($$anchor, {
		get rows() {
			return $.get(rows2);
		},

		set rows($$value) {
			$.set(rows2, $$value, true);
		}
	});

	$.pop();
}