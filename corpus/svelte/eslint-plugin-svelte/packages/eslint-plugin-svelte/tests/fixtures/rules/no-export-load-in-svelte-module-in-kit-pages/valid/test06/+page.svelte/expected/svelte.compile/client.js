import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export function foo() {}

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	function load() {}

	var $$exports = { load };

	return $.pop($$exports);
}