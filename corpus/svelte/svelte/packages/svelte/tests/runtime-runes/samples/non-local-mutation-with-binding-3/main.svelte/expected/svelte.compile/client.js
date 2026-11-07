import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Counter from './Counter.svelte';

export default function Main($$anchor) {
	let object = $.proxy({ shared: { count: 0 }, notshared: { count: 0 } });

	Counter($$anchor, {
		get notshared() {
			return object.notshared;
		},

		get shared() {
			return object.shared;
		},

		set shared($$value) {
			object.shared = $$value;
		}
	});
}