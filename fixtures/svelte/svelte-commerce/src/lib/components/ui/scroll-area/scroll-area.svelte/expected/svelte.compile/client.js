import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui';
import { Scrollbar } from './index.js';
import { cn } from '$lib/core/utils/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'orientation',
	'scrollbarXClasses',
	'scrollbarYClasses',
	'children'
]);

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scroll_area($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		orientation = $.prop($$props, 'orientation', 3, 'vertical'),
		scrollbarXClasses = $.prop($$props, 'scrollbarXClasses', 3, ''),
		scrollbarYClasses = $.prop($$props, 'scrollbarYClasses', 3, ''),
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
							class: 'h-full w-full rounded-[inherit]',
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