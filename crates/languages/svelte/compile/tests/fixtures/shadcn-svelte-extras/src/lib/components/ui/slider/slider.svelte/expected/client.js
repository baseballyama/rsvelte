import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider as SliderPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'orientation',
	'class'
]);

var root = $.from_html(`<span data-slot="slider-track"><!></span> <!>`, 1);

export default function Slider($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let thumbItems = () => ($$arg0?.()).thumbItems;
			var fragment_1 = root();
			var span = $.first_child(fragment_1);
			var node_1 = $.child(span);

			{
				let $0 = $.derived(() => cn('bg-primary absolute select-none data-horizontal:h-full data-vertical:w-full'));

				$.component(node_1, () => SliderPrimitive.Range, ($$anchor, SliderPrimitive_Range) => {
					SliderPrimitive_Range($$anchor, {
						'data-slot': 'slider-range',
						get class() {
							return $.get($0);
						}
					});
				});
			}

			$.reset(span);

			var node_2 = $.sibling(span, 2);

			$.each(node_2, 16, thumbItems, (thumb) => thumb, ($$anchor, thumb) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => SliderPrimitive.Thumb, ($$anchor, SliderPrimitive_Thumb) => {
					SliderPrimitive_Thumb($$anchor, {
						'data-slot': 'slider-thumb',
						get index() {
							return thumb.index;
						},
						class: 'border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50'
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.template_effect(
				($0) => {
					$.set_attribute(span, 'data-orientation', orientation());
					$.set_class(span, 1, $0);
				},
				[
					() => $.clsx(cn('bg-muted bg-muted relative grow overflow-hidden rounded-full data-horizontal:h-1.5 data-horizontal:w-full data-horizontal:w-full data-vertical:h-full data-vertical:h-full data-vertical:w-1.5'))
				]
			);

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn('relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col', $$props.class));

		$.component(node, () => SliderPrimitive.Root, ($$anchor, SliderPrimitive_Root) => {
			SliderPrimitive_Root($$anchor, $.spread_props(
				{
					'data-slot': 'slider',
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

					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}