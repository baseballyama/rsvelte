import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span><!></span>`);

export default function DropdownShortcut($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, '');
	var span = root();
	var node = $.child(span);

	$.snippet(node, () => $$props.children);
	$.reset(span);
	$.template_effect(() => $.set_class(span, 1, `dropdown-shortcut ${className() ?? ''}`, 'svelte-71c1r8'));
	$.append($$anchor, span);
}