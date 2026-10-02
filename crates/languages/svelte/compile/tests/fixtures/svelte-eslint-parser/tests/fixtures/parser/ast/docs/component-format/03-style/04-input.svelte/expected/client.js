import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><style>/* this style tag will be inserted as-is */
		div {
			/* this will apply to all \`<div>\` elements in the DOM */
			color: red;
		}</style></div>`);

export default function _4_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}