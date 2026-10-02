import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'a', 'b', 'c']);

export default function _8_$props_ts_input($$anchor, $$props) {
	let everythingElse = $.rest_props($$props, rest_excludes);
}