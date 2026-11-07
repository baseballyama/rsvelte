import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref'
]);

var root = $.from_html(`<kbd><!></kbd>`);

export default function Command_shortcut($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var kbd = root();

	$.attribute_effect(kbd, ($0) => ({ class: $0, ...restProps }), [
		() => cn('border-border bg-background text-muted-foreground/70 ms-auto -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium', $$props.class)
	]);

	var node = $.child(kbd);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(kbd);
	$.bind_this(kbd, ($$value) => ref($$value), () => ref());
	$.append($$anchor, kbd);
	$.pop();
}