import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';
import Bug3 from './Bug3.svelte';

export default function Allow_reassign_bind2_input($$anchor, $$props) {
	$.push($$props, true);

	let svelteSet = $.state($.proxy(new SvelteSet([])));
	var bind_get = () => $.get(svelteSet);
	var bind_set = (v) => $.set(svelteSet, v, true);

	Bug3($$anchor, {
		get svelteSet() {
			return bind_get();
		},

		set svelteSet($$value) {
			bind_set($$value);
		}
	});

	$.pop();
}