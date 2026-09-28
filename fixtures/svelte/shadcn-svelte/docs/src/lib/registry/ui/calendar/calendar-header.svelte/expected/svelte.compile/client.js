import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Calendar as CalendarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Calendar_header($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium", $$props.class));

		$.component(node, () => CalendarPrimitive.Header, ($$anchor, CalendarPrimitive_Header) => {
			CalendarPrimitive_Header($$anchor, $.spread_props(
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