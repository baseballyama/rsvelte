import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Output($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	console.log(props);
}