import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Menubar as MenubarPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'inset', 'class']);

export default function Menubar_group_heading($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('px-2 py-1.5 text-sm font-medium data-[inset]:ps-8', $$props.class));

		$.component(node, () => MenubarPrimitive.GroupHeading, ($$anchor, MenubarPrimitive_GroupHeading) => {
			MenubarPrimitive_GroupHeading($$anchor, $.spread_props(
				{
					'data-slot': 'menubar-group-heading',
					get 'data-inset'() {
						return $$props.inset;
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