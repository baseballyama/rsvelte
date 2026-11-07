import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command as CommandPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Command_link_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', $$props.class));

		$.component(node, () => CommandPrimitive.LinkItem, ($$anchor, CommandPrimitive_LinkItem) => {
			CommandPrimitive_LinkItem($$anchor, $.spread_props(
				{
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