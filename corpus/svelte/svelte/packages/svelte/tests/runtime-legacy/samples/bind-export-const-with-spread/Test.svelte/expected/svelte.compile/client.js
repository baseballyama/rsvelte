import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test($$anchor, $$props) {
	$.push($$props, true);

	const x = 42;
	var $$exports = { x };

	return $.pop($$exports);
}