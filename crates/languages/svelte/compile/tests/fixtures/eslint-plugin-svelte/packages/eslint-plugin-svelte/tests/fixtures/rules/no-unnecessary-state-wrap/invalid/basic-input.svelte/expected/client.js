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

	// These should be reported as unnecessary $state wrapping
	const set = $.proxy(new SvelteSet());

	const map = $.proxy(new SvelteMap());
	const url = $.proxy(new SvelteURL('https://example.com'));
	const params = $.proxy(new SvelteURLSearchParams('key=value'));
	const date = $.proxy(new SvelteDate());
	const mediaQuery = $.proxy(new MediaQuery('(min-width: 800px)'));

	// Regular state usage is still valid
	const regularState = 42;

	const stateObject = $.proxy({ foo: 'bar' });

	$.pop();
}