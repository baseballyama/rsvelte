import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Comp 2</p>`);

export default function Comp_2($$anchor) {
	var p = root();

	$.append($$anchor, p);
}