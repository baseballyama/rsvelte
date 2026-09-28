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

var root = $.from_html(`<span><!></span>`);

export default function Context_menu_shortcut($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var span = root();

	$.attribute_effect(
		span,
		($0) => ({
			'data-slot': 'context-menu-shortcut',
			class: $0,
			...restProps
		}),
		[
			() => cn('text-muted-foreground group-focus/context-menu-item:text-accent-foreground ml-auto text-xs tracking-widest', $$props.class)
		]
	);

	var node = $.child(span);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(span);
	$.bind_this(span, ($$value) => ref($$value), () => ref());
	$.append($$anchor, span);
	$.pop();
}