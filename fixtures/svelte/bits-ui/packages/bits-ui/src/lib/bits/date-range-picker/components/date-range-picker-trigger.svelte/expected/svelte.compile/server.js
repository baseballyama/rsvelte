import * as $ from 'svelte/internal/server';
import { mergeProps } from "svelte-toolbelt";
import PopoverTrigger from "$lib/bits/popover/components/popover-trigger.svelte";
import { dateRangeFieldAttrs } from "$lib/bits/date-range-field/date-range-field.svelte.js";
import { handleSegmentNavigation, isSegmentNavigationKey } from "$lib/internal/date-time/field/segments.js";

export default function Date_range_picker_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, onkeydown, $$slots, $$events, ...restProps } = $$props;

		function onKeydown(e) {
			if (isSegmentNavigationKey(e.key)) {
				const currNode = e.currentTarget;
				const dateFieldInputNode = currNode.closest(dateRangeFieldAttrs.selector("root"));

				if (!dateFieldInputNode) return;

				handleSegmentNavigation(e, dateFieldInputNode);
			}
		}

		const mergedProps = $.derived(() => mergeProps({ onkeydown }, { onkeydown: onKeydown }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			PopoverTrigger($$renderer, $.spread_props([
				restProps,
				{ 'data-segment': 'trigger' },
				mergedProps(),
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					}
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}