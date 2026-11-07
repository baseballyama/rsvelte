import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

export default function Intermediate($$anchor, $$props) {
	/** @type {{ object: { count: number }}} */
	let object = $.prop($$props, 'object', 7);

	Counter($$anchor, {
		get object() {
			return object();
		},

		set object($$value) {
			object($$value);
		}
	});
}