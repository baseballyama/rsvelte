import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	SvelteSet,
	SvelteMap,
	SvelteURL,
	SvelteURLSearchParams,
	SvelteDate,
	MediaQuery
} from 'svelte/reactivity';

export default function Basic_input($$anchor, $$props) {
	$.push($$props, true);

	// Valid usage of reactive classes without $state wrapping
	const set = new SvelteSet();

	const map = new SvelteMap();
	const url = new SvelteURL('https://example.com');
	const params = new SvelteURLSearchParams('key=value');
	const date = new SvelteDate();
	const mediaQuery = new MediaQuery('(min-width: 800px)');

	// Regular state usage is still valid
	const regularState = 42;

	const stateObject = $.proxy({ foo: 'bar' });

	$.pop();
}