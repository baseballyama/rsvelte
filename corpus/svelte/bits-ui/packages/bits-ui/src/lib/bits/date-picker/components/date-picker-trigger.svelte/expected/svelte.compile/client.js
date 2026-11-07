import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeProps } from "svelte-toolbelt";
import PopoverTrigger from "$lib/bits/popover/components/popover-trigger.svelte";
import { dateFieldAttrs } from "$lib/bits/date-field/date-field.svelte.js";
import { handleSegmentNavigation, isSegmentNavigationKey } from "$lib/internal/date-time/field/segments.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'onkeydown']);

export default function Date_picker_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	function onKeydown(e) {
		if (isSegmentNavigationKey(e.key)) {
			const currNode = e.currentTarget;
			const dateFieldInputNode = currNode.closest(dateFieldAttrs.selector("input"));

			if (!dateFieldInputNode) return;

			handleSegmentNavigation(e, dateFieldInputNode);
		}
	}

	const mergedProps = $.derived(() => mergeProps({ onkeydown: $$props.onkeydown }, { onkeydown: onKeydown }));

	PopoverTrigger($$anchor, $.spread_props(() => restProps, { 'data-segment': 'trigger' }, () => $.get(mergedProps), {
		get ref() {
			return ref();
		},

		set ref($$value) {
			ref($$value);
		}
	}));

	$.pop();
}