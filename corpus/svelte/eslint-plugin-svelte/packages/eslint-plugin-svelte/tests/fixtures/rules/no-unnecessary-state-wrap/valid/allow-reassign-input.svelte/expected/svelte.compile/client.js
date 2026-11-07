import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet, SvelteMap } from 'svelte/reactivity';

export default function Allow_reassign_input($$anchor, $$props) {
	$.push($$props, true);

	// These should be allowed when allowReassign is true and variables are reassigned
	let set = $.state($.proxy(new SvelteSet()));

	$.set(set, new SvelteSet([1, 2, 3]), true);

	let map = $.state($.proxy(new SvelteMap()));

	$.set(map, new SvelteMap([['key', 'value']]), true);
	$.pop();
}