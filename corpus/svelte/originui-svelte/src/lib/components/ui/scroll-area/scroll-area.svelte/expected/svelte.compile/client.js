import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scrollbar from './scroll-area-scrollbar.svelte';
import { cn } from '$lib/utils.js';
import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'orientation',
	'ref',
	'scrollbarXClasses',
	'scrollbarYClasses'
]);

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scroll_area($$anchor, $$props) {
	$.push($$props, true);

	let orientation = $.prop($$props, 'orientation', 3, 'vertical'),
		ref = $.prop($$props, 'ref', 15, null),
		scrollbarXClasses = $.prop($$props, 'scrollbarXClasses', 3, 'h-2.5 flex-col border-t border-t-transparent p-px'),
		scrollbarYClasses = $.prop($$props, 'scrollbarYClasses', 3, 'h-full w-2.5 border-l border-l-transparent p-px'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('relative overflow-hidden', $$props.class));

		$.component(node, () => ScrollAreaPrimitive.Root, ($$anchor, ScrollAreaPrimitive_Root) => {
			ScrollAreaPrimitive_Root($$anchor, $.spread_props(() => restProps, {
				get class() {
					return $.get($0);
				},

				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => ScrollAreaPrimitive.Viewport, ($$anchor, ScrollAreaPrimitive_Viewport) => {
						ScrollAreaPrimitive_Viewport($$anchor, {
							class: 'h-full w-full  rounded-[inherit]',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.snippet(node_2, () => $$props.children ?? $.noop);
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_1, 2);

					{
						var consequent = ($$anchor) => {
							Scrollbar($$anchor, {
								orientation: 'vertical',
								get class() {
									return scrollbarYClasses();
								}
							});
						};

						$.if(node_3, ($$render) => {
							if (orientation() === 'vertical' || orientation() === 'both') $$render(consequent);
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent_1 = ($$anchor) => {
							Scrollbar($$anchor, {
								orientation: 'horizontal',
								get class() {
									return scrollbarXClasses();
								}
							});
						};

						$.if(node_4, ($$render) => {
							if (orientation() === 'horizontal' || orientation() === 'both') $$render(consequent_1);
						});
					}

					var node_5 = $.sibling(node_4, 2);

					$.component(node_5, () => ScrollAreaPrimitive.Corner, ($$anchor, ScrollAreaPrimitive_Corner) => {
						ScrollAreaPrimitive_Corner($$anchor, {});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}