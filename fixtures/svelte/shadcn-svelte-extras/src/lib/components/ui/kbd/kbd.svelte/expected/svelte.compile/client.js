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

var root = $.from_html(`<kbd><!></kbd>`);

export default function Kbd($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var kbd = root();

	$.attribute_effect(kbd, ($0) => ({ 'data-slot': 'kbd', class: $0, ...restProps }), [
		() => cn("bg-muted text-muted-foreground in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none [&_svg:not([class*='size-'])]:size-3", $$props.class)
	]);

	var node = $.child(kbd);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(kbd);
	$.bind_this(kbd, ($$value) => ref($$value), () => ref());
	$.append($$anchor, kbd);
	$.pop();
}