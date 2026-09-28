import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> <!></div>`);

export default function Child($$anchor, $$props) {
	let prop = $.prop($$props, 'prop', 3, '');
	var div = root();
	var text = $.child(div, true);
	var node = $.sibling(text);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.template_effect(() => $.set_text(text, prop()));
	$.append($$anchor, div);
}