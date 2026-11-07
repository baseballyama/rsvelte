import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';
import Bug3 from './Bug3.svelte';

export default function Allow_reassign_bind1_input($$anchor, $$props) {
	$.push($$props, true);

	let svelteSet = $.state($.proxy(new SvelteSet([])));

	Bug3($$anchor, {
		get svelteSet() {
			return $.get(svelteSet);
		},

		set svelteSet($$value) {
			$.set(svelteSet, $$value, true);
		}
	});

	$.pop();
}