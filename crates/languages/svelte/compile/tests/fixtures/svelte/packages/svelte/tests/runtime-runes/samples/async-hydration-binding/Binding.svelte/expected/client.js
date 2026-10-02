import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Bound from './Bound.svelte';

export default function Binding($$anchor) {
	let open;

	Bound($$anchor, {
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		}
	});
}