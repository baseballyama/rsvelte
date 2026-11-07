import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Command as CommandPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref']);

export default function Command_link_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('aria-selected:bg-accent aria-selected:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50', $$props.class));

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