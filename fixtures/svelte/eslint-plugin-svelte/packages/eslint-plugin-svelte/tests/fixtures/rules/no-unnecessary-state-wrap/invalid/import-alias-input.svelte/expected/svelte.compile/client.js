import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet as CustomSet, SvelteMap as CustomMap } from 'svelte/reactivity';

export default function Import_alias_input($$anchor, $$props) {
	$.push($$props, true);

	// These should be reported as unnecessary $state wrapping
	const set = $.proxy(new CustomSet());

	const map = $.proxy(new CustomMap());

	$.pop();
}