import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'a']);

export default function Rest_and_index_input($$anchor, $$props) {
	let otherProps = $.rest_props($$props, rest_excludes);

	console.log($$props.a, otherProps);
}