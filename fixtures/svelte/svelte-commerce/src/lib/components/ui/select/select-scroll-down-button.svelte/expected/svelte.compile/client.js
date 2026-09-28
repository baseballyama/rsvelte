import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChevronDown } from '@lucide/svelte';
import { Select as SelectPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Select_scroll_down_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('flex cursor-default items-center justify-center py-1', $$props.class));

		$.component(node, () => SelectPrimitive.ScrollDownButton, ($$anchor, SelectPrimitive_ScrollDownButton) => {
			SelectPrimitive_ScrollDownButton($$anchor, $.spread_props(
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
						ChevronDown($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}