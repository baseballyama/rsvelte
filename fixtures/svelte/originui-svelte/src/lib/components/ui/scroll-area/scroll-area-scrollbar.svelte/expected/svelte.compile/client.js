import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'orientation',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Scroll_area_scrollbar($$anchor, $$props) {
	$.push($$props, true);

	let orientation = $.prop($$props, 'orientation', 3, 'vertical'),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('flex touch-none transition-colors select-none', orientation() === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-px', orientation() === 'horizontal' && 'h-2.5 w-full border-t border-t-transparent p-px', $$props.class));

		$.component(node, () => ScrollAreaPrimitive.Scrollbar, ($$anchor, ScrollAreaPrimitive_Scrollbar) => {
			ScrollAreaPrimitive_Scrollbar($$anchor, $.spread_props(
				{
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

						{
							let $0 = $.derived(() => cn('bg-border relative rounded-full', orientation() === 'vertical' && 'flex-1'));

							$.component(node_2, () => ScrollAreaPrimitive.Thumb, ($$anchor, ScrollAreaPrimitive_Thumb) => {
								ScrollAreaPrimitive_Thumb($$anchor, {
									get class() {
										return $.get($0);
									}
								});
							});
						}

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