import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator as SeparatorPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'data-slot'
]);

export default function Separator($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		dataSlot = $.prop($$props, 'data-slot', 3, "separator"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", $$props.class));

		$.component(node, () => SeparatorPrimitive.Root, ($$anchor, SeparatorPrimitive_Root) => {
			SeparatorPrimitive_Root($$anchor, $.spread_props(
				{
					get 'data-slot'() {
						return dataSlot();
					},

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