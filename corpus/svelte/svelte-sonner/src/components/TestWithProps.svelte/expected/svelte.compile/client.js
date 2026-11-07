import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function TestWithProps($$anchor, $$props) {
	var div = root();

	$.html(div, () => $$props.message, true);
	$.reset(div);
	$.append($$anchor, div);
}