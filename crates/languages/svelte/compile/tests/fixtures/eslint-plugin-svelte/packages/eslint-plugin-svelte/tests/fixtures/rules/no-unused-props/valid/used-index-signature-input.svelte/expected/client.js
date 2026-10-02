import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'a']);

export default function Used_index_signature_input($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);

	console.log(rest);
}