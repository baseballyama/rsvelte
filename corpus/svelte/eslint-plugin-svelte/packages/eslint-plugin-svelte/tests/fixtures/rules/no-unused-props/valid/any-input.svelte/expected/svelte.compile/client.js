import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Any_input($$anchor, $$props) {
	$.push($$props, true);

	// There is no type annotation, so it is treated as any.
	let props = $.rest_props($$props, rest_excludes);

	console.log($$props.anything);
	$.pop();
}