import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="text-lg font-medium text-gray-900 underline hover:no-underline dark:text-white"><!></a>`);

export default function A($$anchor, $$props) {
	let children = $.prop($$props, 'children', 3, undefined);
	var a = root();
	var node = $.child(a);

	$.snippet(node, () => children() ?? $.noop);
	$.reset(a);
	$.template_effect(() => $.set_attribute(a, 'href', $$props.href));
	$.append($$anchor, a);
}