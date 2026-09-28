import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	var div = root();

	$.set_class(div, 1, 'one', null, {}, { two: true, three: true });
	$.append($$anchor, div);
}