import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet, SvelteMap } from 'svelte/reactivity';

export default function Allow_reassign_input($$anchor, $$props) {
	$.push($$props, true);

	// These should be reported as unnecessary $state wrapping
	// even with allowReassign: true because they are not reassigned
	const set = $.proxy(new SvelteSet());

	let map = $.proxy(new SvelteMap());

	$.pop();
}