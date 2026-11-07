import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'orientation',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Scroll_area_scrollbar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		orientation = $.prop($$props, 'orientation', 3, "vertical"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-scroll-area-scrollbar flex touch-none p-px transition-colors select-none", $$props.class));

		$.component(node, () => ScrollAreaPrimitive.Scrollbar, ($$anchor, ScrollAreaPrimitive_Scrollbar) => {
			ScrollAreaPrimitive_Scrollbar($$anchor, $.spread_props(
				{
					'data-slot': 'scroll-area-scrollbar',
					get 'data-orientation'() {
						return orientation();
					},

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
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.snippet(node_1, () => $$props.children ?? $.noop);

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => ScrollAreaPrimitive.Thumb, ($$anchor, ScrollAreaPrimitive_Thumb) => {
							ScrollAreaPrimitive_Thumb($$anchor, {
								'data-slot': 'scroll-area-thumb',
								class: 'cn-scroll-area-thumb relative flex-1 bg-border'
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}