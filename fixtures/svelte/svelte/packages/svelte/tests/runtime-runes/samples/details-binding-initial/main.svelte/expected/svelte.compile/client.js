import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<details><summary>Details</summary> ...</details>`);

export default function Main($$anchor) {
	let open = $.state(true);
	var details = root();

	$.bind_property('open', 'toggle', details, ($$value) => $.set(open, $$value), () => $.get(open));
	$.append($$anchor, details);
}