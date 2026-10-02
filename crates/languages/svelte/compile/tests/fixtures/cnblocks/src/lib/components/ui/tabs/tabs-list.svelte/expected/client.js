import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs as TabsPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Tabs_list($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", $$props.class));

		$.component(node, () => TabsPrimitive.List, ($$anchor, TabsPrimitive_List) => {
			TabsPrimitive_List($$anchor, $.spread_props(
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