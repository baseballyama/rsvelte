import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function DropdownLabel($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, '');
	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `dropdown-label ${className() ?? ''}`, 'svelte-e8c13o'));
	$.append($$anchor, div);
}