import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menubar as MenubarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'inset',
	'variant'
]);

export default function Menubar_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		inset = $.prop($$props, 'inset', 3, undefined),
		variant = $.prop($$props, 'variant', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive! not-data-[variant=destructive]:focus:**:text-accent-foreground group/menubar-item flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm data-disabled:opacity-50 data-inset:pl-8 [&_svg:not([class*='size-'])]:size-4", $$props.class));

		$.component(node, () => MenubarPrimitive.Item, ($$anchor, MenubarPrimitive_Item) => {
			MenubarPrimitive_Item($$anchor, $.spread_props(
				{
					'data-slot': 'menubar-item',
					get 'data-inset'() {
						return inset();
					},

					get 'data-variant'() {
						return variant();
					},

					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}