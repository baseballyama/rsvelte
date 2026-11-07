import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div role="tablist"><!></div>`);

export default function TabsList($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, '');
	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `tabs-list ${className() ?? ''}`, 'svelte-jdi39s'));
	$.append($$anchor, div);
}