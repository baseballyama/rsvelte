import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Optional_unused_input($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	console.log($$props.required);

	if ($$props.optional !== undefined) {
		console.log($$props.optional);
	}

	$.pop();
}