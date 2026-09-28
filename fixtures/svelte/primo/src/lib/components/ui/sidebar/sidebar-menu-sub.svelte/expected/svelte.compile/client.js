import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.ts';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<ul><!></ul>`);

export default function Sidebar_menu_sub($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var ul = root();

	$.attribute_effect(ul, ($0) => ({ 'data-sidebar': 'menu-sub', class: $0, ...restProps }), [
		() => cn('border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5', 'group-data-[collapsible=icon]:hidden', $$props.class)
	]);

	var node = $.child(ul);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ul);
	$.bind_this(ul, ($$value) => ref($$value), () => ref());
	$.append($$anchor, ul);
	$.pop();
}