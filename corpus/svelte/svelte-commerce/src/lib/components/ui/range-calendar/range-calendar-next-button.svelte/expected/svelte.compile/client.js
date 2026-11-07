import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
import { ChevronRight } from '@lucide/svelte';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import { cn } from '$lib/core/utils';

const Fallback = ($$anchor) => {
	ChevronRight($$anchor, {});
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

export default function Range_calendar_next_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100', $$props.class));
		let $1 = $.derived(() => $$props.children || Fallback);

		$.component(node, () => RangeCalendarPrimitive.NextButton, ($$anchor, RangeCalendarPrimitive_NextButton) => {
			RangeCalendarPrimitive_NextButton($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get children() {
						return $.get($1);
					},

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

	$.append($$anchor, fragment_1);
	$.pop();
}