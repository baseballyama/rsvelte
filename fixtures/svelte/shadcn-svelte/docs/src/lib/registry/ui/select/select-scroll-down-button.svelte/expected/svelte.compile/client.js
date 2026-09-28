import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Select_scroll_down_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-select-scroll-down-button bottom-0 w-full", $$props.class));

		$.component(node, () => SelectPrimitive.ScrollDownButton, ($$anchor, SelectPrimitive_ScrollDownButton) => {
			SelectPrimitive_ScrollDownButton($$anchor, $.spread_props(
				{
					'data-slot': 'select-scroll-down-button',
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
						IconPlaceholder($$anchor, {
							lucide: 'ChevronDownIcon',
							tabler: 'IconChevronDown',
							hugeicons: 'ArrowDown01Icon',
							phosphor: 'CaretDownIcon',
							remixicon: 'RiArrowDownSLine'
						});
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}