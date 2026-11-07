import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Nested_unused_input($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

	console.log($$props.user.name);
	$.pop();
}