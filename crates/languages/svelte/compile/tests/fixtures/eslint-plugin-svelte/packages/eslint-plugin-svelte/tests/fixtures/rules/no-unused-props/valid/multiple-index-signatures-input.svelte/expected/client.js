import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'name']);

export default function Multiple_index_signatures_input($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);

	console.log($$props.name);
}