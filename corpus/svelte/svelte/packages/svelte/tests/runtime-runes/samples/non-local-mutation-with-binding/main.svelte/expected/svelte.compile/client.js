import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

export default function Main($$anchor) {
	let object = $.state($.proxy({ count: 0 }));

	Counter($$anchor, {
		get object() {
			return $.get(object);
		},

		set object($$value) {
			$.set(object, $$value, true);
		}
	});
}