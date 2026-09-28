import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { Tabs as TabsPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export const tabsListVariants = tv({
	base: 'group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-[3px] group-data-horizontal/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none',
	variants: {
		variant: {
			default: 'cn-tabs-list-variant-default bg-muted',
			line: 'cn-tabs-list-variant-line gap-1 bg-transparent'
		}
	},
	defaultVariants: { variant: 'default' }
});

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'variant', 'class']);

export default function Tabs_list($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn(tabsListVariants({ variant: variant() }), $$props.class));

		$.component(node, () => TabsPrimitive.List, ($$anchor, TabsPrimitive_List) => {
			TabsPrimitive_List($$anchor, $.spread_props(
				{
					'data-slot': 'tabs-list',
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