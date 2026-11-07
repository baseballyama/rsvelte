import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import { useSidebar } from "./context.svelte.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<button><!></button>`);

export default function Sidebar_rail($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const sidebar = useSidebar();
	var button = root();

	$.attribute_effect(
		button,
		($0) => ({
			'data-sidebar': 'rail',
			'data-slot': 'sidebar-rail',
			'aria-label': 'Toggle Sidebar',
			tabIndex: -1,
			onclick: sidebar.toggle,
			title: 'Toggle Sidebar',
			class: $0,
			...restProps
		}),
		[
			() => cn("hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-end-4 group-data-[side=right]:start-0 after:absolute after:inset-y-0 after:start-[calc(1/2*100%-1px)] after:w-[2px] sm:flex", "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:start-full", "[[data-side=left][data-collapsible=offcanvas]_&]:-end-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-start-2", $$props.class)
		]
	);

	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button);
	$.bind_this(button, ($$value) => ref($$value), () => ref());
	$.append($$anchor, button);
	$.pop();
}