import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function DropdownSeparator($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, '');
	var div = root();

	$.template_effect(() => $.set_class(div, 1, `dropdown-separator ${className() ?? ''}`, 'svelte-kr8n27'));
	$.append($$anchor, div);
}