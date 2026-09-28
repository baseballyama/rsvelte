import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	var div = root();

	$.html(div, () => '', true);
	$.reset(div);
	$.append($$anchor, div);
}