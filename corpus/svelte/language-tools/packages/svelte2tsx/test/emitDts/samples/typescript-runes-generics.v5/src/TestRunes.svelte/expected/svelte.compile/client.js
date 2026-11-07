import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function TestRunes($$anchor, $$props) {
	$.push($$props, true);

	function baz() {}

	var $$exports = { baz };

	return $.pop($$exports);
}