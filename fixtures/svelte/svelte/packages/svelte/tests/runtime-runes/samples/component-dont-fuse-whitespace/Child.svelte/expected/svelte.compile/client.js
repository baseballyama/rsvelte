import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>text before the render tag <!></p>`);

export default function Child($$anchor, $$props) {
	var p = root();
	var node = $.sibling($.child(p));

	$.snippet(node, () => $$props.children);
	$.reset(p);
	$.append($$anchor, p);
}