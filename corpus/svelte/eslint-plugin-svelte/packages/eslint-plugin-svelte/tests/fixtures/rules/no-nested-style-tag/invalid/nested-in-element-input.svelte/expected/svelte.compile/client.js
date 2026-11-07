import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><style>p { color: red; }</style></div>`);

export default function Nested_in_element_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}