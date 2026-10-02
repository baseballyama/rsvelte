import * as $ from 'svelte/internal/server';
import { mergeProps } from "svelte-toolbelt";
import PopoverContentStatic from "$lib/bits/popover/components/popover-content-static.svelte";
import { pickerOpenFocus } from "$lib/internal/date-time/calendar-helpers.svelte.js";

export default function Date_picker_content_static($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, onOpenAutoFocus, $$slots, $$events, ...restProps } = $$props;
		const mergedProps = $.derived(() => mergeProps({ onOpenAutoFocus }, { onOpenAutoFocus: pickerOpenFocus }));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			PopoverContentStatic($$renderer, $.spread_props([
				mergedProps(),
				restProps,
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