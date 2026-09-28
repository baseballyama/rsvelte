import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="bg-dark-10 relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full"><!></span> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="w-full md:max-w-[400px]"><!></div>`);

export default function Slider_demo_thumb_labels($$anchor) {
	let value = $.state($.proxy([5, 7, 10]));
	var div = root_2();
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let tickItems = () => ($$arg0?.()).tickItems;
			var fragment = root_1();
			var span = $.first_child(fragment);
			var node_1 = $.child(span);

			$.component(node_1, () => Slider.Range, ($$anchor, Slider_Range) => {
				Slider_Range($$anchor, { class: 'bg-foreground absolute h-full' });
			});

			$.reset(span);

			var node_2 = $.sibling(span, 2);

			$.component(node_2, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
				Slider_Thumb($$anchor, {
					index: 0,
					class: 'border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => Slider.ThumbLabel, ($$anchor, Slider_ThumbLabel) => {
				Slider_ThumbLabel($$anchor, {
					index: 0,
					class: 'bg-muted text-foreground mb-5 text-nowrap rounded-md px-2 py-1 text-sm',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Check in');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_3, 2);

			$.component(node_4, () => Slider.Thumb, ($$anchor, Slider_Thumb_1) => {
				Slider_Thumb_1($$anchor, {
					index: 1,
					class: 'border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
				});
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => Slider.ThumbLabel, ($$anchor, Slider_ThumbLabel_1) => {
				Slider_ThumbLabel_1($$anchor, {
					index: 1,
					class: 'bg-muted text-foreground mb-5 text-nowrap rounded-md px-2 py-1 text-sm',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Dinner');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => Slider.Thumb, ($$anchor, Slider_Thumb_2) => {
				Slider_Thumb_2($$anchor, {
					index: 2,
					class: 'border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
				});
			});

			var node_7 = $.sibling(node_6, 2);

			$.component(node_7, () => Slider.ThumbLabel, ($$anchor, Slider_ThumbLabel_2) => {
				Slider_ThumbLabel_2($$anchor, {
					index: 2,
					class: 'bg-muted text-foreground mb-5 text-nowrap rounded-md px-2 py-1 text-sm',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Sleep');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_7, 2);

			$.each(node_8, 17, tickItems, ({ index, value }) => index, ($$anchor, $$item, $$index, $$array) => {
				let index = () => $.get($$item).index;
				let value = () => $.get($$item).value;
				var fragment_1 = root();
				var node_9 = $.first_child(fragment_1);

				$.component(node_9, () => Slider.Tick, ($$anchor, Slider_Tick) => {
					Slider_Tick($$anchor, {
						get index() {
							return index();
						},
						class: 'dark:bg-background/20 bg-background z-1 h-2 w-[1px]'
					});
				});

				var node_10 = $.sibling(node_9, 2);

				$.component(node_10, () => Slider.TickLabel, ($$anchor, Slider_TickLabel) => {
					Slider_TickLabel($$anchor, {
						get index() {
							return index();
						},
						class: 'text-muted-foreground data-selected:text-foreground mt-5 text-xs font-medium leading-none',
						position: 'bottom',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, `${value() ?? ''}pm`));
							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => Slider.Root, ($$anchor, Slider_Root) => {
			Slider_Root($$anchor, {
				step: 1,
				min: 4,
				max: 11,
				type: 'multiple',
				class: 'relative flex w-full touch-none select-none items-center',
				trackPadding: 2,
				autoSort: false,
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