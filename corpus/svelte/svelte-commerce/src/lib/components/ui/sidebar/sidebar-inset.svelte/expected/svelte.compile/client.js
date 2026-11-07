import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/core/utils';

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

	$.attribute_effect(main, ($0) => ({ class: $0, ...restProps }), [
		() => cn('relative flex min-h-svh flex-1 flex-col bg-background', 'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow', $$props.class)
	]);

	var node = $.child(main);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(main);
	$.bind_this(main, ($$value) => ref($$value), () => ref());
	$.append($$anchor, main);
	$.pop();
}