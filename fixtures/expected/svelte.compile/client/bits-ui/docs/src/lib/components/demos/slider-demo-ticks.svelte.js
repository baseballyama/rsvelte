import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "bits-ui";

var root = $.from_html(`<span class="bg-dark-10 relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full"><!></span> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="w-full md:max-w-[280px]"><!></div>`);

export default function Slider_demo_ticks($$anchor) {
	let value = $.state($.proxy([5, 7]));
	var div = root_1();
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let tickItems = () => ($$arg0?.()).tickItems;
			let thumbs = () => ($$arg0?.()).thumbs;
			var fragment = root();
			var span = $.first_child(fragment);
			var node_1 = $.child(span);

			$.component(node_1, () => Slider.Range, ($$anchor, Slider_Range) => {
				Slider_Range($$anchor, { class: 'bg-foreground absolute h-full' });
			});

			$.reset(span);

			var node_2 = $.sibling(span, 2);

			$.each(node_2, 16, thumbs, (thumb) => thumb, ($$anchor, thumb) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
					Slider_Thumb($$anchor, {
						get index() {
							return thumb;
						},
						class: 'border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
					});
				});

				$.append($$anchor, fragment_1);
			});

			var node_4 = $.sibling(node_2, 2);

			$.each(node_4, 17, tickItems, ({ index }) => index, ($$anchor, $$item) => {
				let index = () => $.get($$item).index;
				var fragment_2 = $.comment();
				var node_5 = $.first_child(fragment_2);

				$.component(node_5, () => Slider.Tick, ($$anchor, Slider_Tick) => {
					Slider_Tick($$anchor, {
						get index() {
							return index();
						},
						class: 'dark:bg-background/20 bg-background z-1 h-2 w-[1px]'
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => Slider.Root, ($$anchor, Slider_Root) => {
			Slider_Root($$anchor, {
				step: 1,
				min: 0,
				max: 10,
				type: 'multiple',
				class: 'relative flex w-full touch-none select-none items-center',
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}