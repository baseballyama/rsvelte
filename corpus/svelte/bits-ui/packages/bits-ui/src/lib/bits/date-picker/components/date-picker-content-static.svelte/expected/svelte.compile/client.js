import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeProps } from "svelte-toolbelt";
import PopoverContentStatic from "$lib/bits/popover/components/popover-content-static.svelte";
import { pickerOpenFocus } from "$lib/internal/date-time/calendar-helpers.svelte.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'onOpenAutoFocus']);

export default function Date_picker_content_static($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const mergedProps = $.derived(() => mergeProps({ onOpenAutoFocus: $$props.onOpenAutoFocus }, { onOpenAutoFocus: pickerOpenFocus }));

	PopoverContentStatic($$anchor, $.spread_props(() => $.get(mergedProps), () => restProps, {
		get ref() {
			return ref();
		},

		set ref($$value) {
			ref($$value);
		}
	}));

	$.pop();
}