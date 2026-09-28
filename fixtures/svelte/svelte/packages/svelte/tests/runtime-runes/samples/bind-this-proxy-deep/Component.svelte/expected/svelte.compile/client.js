import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	// svelte-ignore state_referenced_locally
	const name = $$props.name;

	var $$exports = { name };

	return $.pop($$exports);
}