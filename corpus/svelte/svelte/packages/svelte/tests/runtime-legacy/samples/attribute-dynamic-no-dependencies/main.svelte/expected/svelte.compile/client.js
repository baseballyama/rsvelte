import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div>bar</div></div>`);

export default function Main($$anchor) {
	var div = root();
	var div_1 = $.child(div);

	$.set_attribute(div_1, 'title', 'foo');
	$.reset(div);
	$.append($$anchor, div);
}