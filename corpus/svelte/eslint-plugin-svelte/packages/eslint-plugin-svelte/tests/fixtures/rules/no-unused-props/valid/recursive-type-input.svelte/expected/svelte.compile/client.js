import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Recursive_type_input($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	console.log($$props.value, $$props.children?.[0]?.value);
	$.pop();
}