import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'borderClass',
	'border'
]);

var root = $.from_html(`<ul><!></ul>`);

export default function SidebarGroup($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, "space-y-2"),
		borderClass = $.prop($$props, 'borderClass', 3, "pt-4 mt-4 border-t border-gray-200 dark:border-gray-700"),
		border = $.prop($$props, 'border', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var ul = root();

	$.attribute_effect(ul, ($0) => ({ ...restProps, class: $0 }), [() => border() ? clsx(borderClass()) : clsx(className())]);

	var node = $.child(ul);

	$.snippet(node, () => $$props.children);
	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
}