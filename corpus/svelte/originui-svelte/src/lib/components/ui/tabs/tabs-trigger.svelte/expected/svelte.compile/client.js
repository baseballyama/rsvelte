import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Tabs as TabsPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref', 'value']);

export default function Tabs_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-selected:text-foreground data-[state=active]:bg-background inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap outline-hidden transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-selected:shadow-xs [&_svg]:shrink-0', $$props.class));

		$.component(node, () => TabsPrimitive.Trigger, ($$anchor, TabsPrimitive_Trigger) => {
			TabsPrimitive_Trigger($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					},

					get value() {
						return $$props.value;
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