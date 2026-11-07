import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<li><!></li>`);

export default function Sidebar_menu_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var li = root();

	$.attribute_effect(
		li,
		($0) => ({
			'data-slot': 'sidebar-menu-item',
			'data-sidebar': 'menu-item',
			class: $0,
			...restProps
		}),
		[() => cn('group/menu-item relative', $$props.class)]
	);

	var node = $.child(li);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(li);
	$.bind_this(li, ($$value) => ref($$value), () => ref());
	$.append($$anchor, li);
	$.pop();
}