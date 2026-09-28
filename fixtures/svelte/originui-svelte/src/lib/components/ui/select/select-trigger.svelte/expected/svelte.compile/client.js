import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import { Select as SelectPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref'
]);

var root = $.from_html(`<span class="pointer-events-none"><!></span> <!>`, 1);

export default function Select_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('border-input bg-background text-foreground focus:border-ring focus:ring-ring/20 data-placeholder:text-muted-foreground/70 flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start text-sm shadow-xs shadow-black/5 focus:ring-[3px] focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&>span]:min-w-0', $$props.class));

		$.component(node, () => SelectPrimitive.Trigger, ($$anchor, SelectPrimitive_Trigger) => {
			SelectPrimitive_Trigger($$anchor, $.spread_props(
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
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var span = $.first_child(fragment_1);
						var node_1 = $.child(span);

						$.snippet(node_1, () => $$props.children ?? $.noop);
						$.reset(span);

						var node_2 = $.sibling(span, 2);

						ChevronDown(node_2, { size: 16, class: 'text-muted-foreground/80 shrink-0' });
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}