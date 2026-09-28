import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Empty_image($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, '');
	var div = root();

	$.template_effect(() => $.set_class(div, 1, `h-full w-full bg-gray-100 dark:bg-gray-800 ${className()}`));
	$.append($$anchor, div);
}