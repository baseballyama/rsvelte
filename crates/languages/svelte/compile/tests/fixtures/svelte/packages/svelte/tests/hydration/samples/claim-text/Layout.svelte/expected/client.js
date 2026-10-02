import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>This <code>p</code> and the <code>slot</code> below are direct children of the root.</p> <!>`, 1);

export default function Layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}