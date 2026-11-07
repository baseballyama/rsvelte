import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<foo></foo>`);

export default function _1_input($$anchor) {
	var foo = root();

	$.bind_this(foo, ($$value) => dom_node = $$value, () => dom_node);
	$.append($$anchor, foo);
}