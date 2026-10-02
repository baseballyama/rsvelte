import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`Display: <!>`, 1);

export default function Display($$anchor, $$props) {
	$.next();

	var fragment = root();
	var node = $.sibling($.first_child(fragment));

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}