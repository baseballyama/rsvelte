import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/"><!></a>`);

export default function Link($$anchor, $$props) {
	var a = root();
	var node = $.child(a);

	$.snippet(node, () => $$props.children);
	$.reset(a);
	$.append($$anchor, a);
}