import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Computed_property_input($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	console.log(props['dynamic']);
	$.pop();
}