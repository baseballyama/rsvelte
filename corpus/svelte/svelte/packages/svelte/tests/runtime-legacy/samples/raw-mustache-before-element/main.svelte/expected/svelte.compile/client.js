import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p><!><span>baz</span></p>`);

export default function Main($$anchor) {
	var p = root();
	var node = $.child(p);

	$.html(node, () => 'x');
	$.next();
	$.reset(p);
	$.append($$anchor, p);
}