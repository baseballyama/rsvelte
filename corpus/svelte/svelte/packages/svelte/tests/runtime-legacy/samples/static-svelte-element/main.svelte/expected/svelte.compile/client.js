import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Main($$anchor) {
	var div = root();
	var node = $.child(div);

	$.element(node, () => "p", false);
	$.reset(div);
	$.append($$anchor, div);
}