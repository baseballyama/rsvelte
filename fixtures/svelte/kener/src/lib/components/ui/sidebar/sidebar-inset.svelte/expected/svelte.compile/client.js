import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<main><!></main>`);

export default function Sidebar_inset($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root();

	$.attribute_effect(main, ($0) => ({ 'data-slot': 'sidebar-inset', class: $0, ...restProps }), [
		() => cn("bg-background relative flex w-full flex-1 flex-col", "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ms-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ms-2", $$props.class)
	]);

	var node = $.child(main);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(main);
	$.bind_this(main, ($$value) => ref($$value), () => ref());
	$.append($$anchor, main);
	$.pop();
}