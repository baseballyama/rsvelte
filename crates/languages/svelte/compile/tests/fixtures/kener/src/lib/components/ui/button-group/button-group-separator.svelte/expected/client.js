import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import { Separator } from "$lib/components/ui/separator/index.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'orientation'
]);

export default function Button_group_separator($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		orientation = $.prop($$props, 'orientation', 3, "vertical"),
		restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn("bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto", $$props.class));

		Separator($$anchor, $.spread_props(
			{
				'data-slot': 'button-group-separator',
				get orientation() {
					return orientation();
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
	}

	$.pop();
}