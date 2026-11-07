import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="bg-dark-10 relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full"><!></span> <!> <!>`, 1);
var root_2 = $.from_html(`<span class="bg-dark-10 relative h-full w-2 cursor-pointer overflow-hidden rounded-full"><!></span> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="w-full md:max-w-[320px]"><!></div> <div class="flex h-[320px] w-full justify-center"><!></div>`, 1);

export default function Slider_demo_custom_steps($$anchor) {
	let fontSize = $.state(16);
	const fontSizes = [0, 4, 8, 16, 24];
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let tickItems = () => ($$arg0?.()).tickItems;
			var fragment_1 = root_1();
			var span = $.first_child(fragment_1);
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

			$.each(node_3, 17, tickItems, ({ index, value }) => index, ($$anchor, $$item) => {
				let index = () => $.get($$item).index;
				let value = () => $.get($$item).value;
				var fragment_2 = root();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => Slider.Tick, ($$anchor, Slider_Tick) => {
					Slider_Tick($$anchor, {
						get index() {
							return index();
						},
						class: 'dark:bg-background bg-background z-1 h-2 w-[1px]'
					});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => Slider.TickLabel, ($$anchor, Slider_TickLabel) => {
					Slider_TickLabel($$anchor, {
						get index() {
							return index();
						},
						class: 'text-muted-foreground data-selected:text-foreground mb-5 text-sm font-medium leading-none',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${value() ?? ''}px`));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.component(node, () => Slider.Root, ($$anchor, Slider_Root) => {
			Slider_Root($$anchor, {
				type: 'single',
				get step() {
					return fontSizes;
				},
				class: 'relative flex w-full touch-none select-none items-center',
				trackPadding: 3,
				get value() {
					return $.get(fontSize);
				},

				set value($$value) {
					$.set(fontSize, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_6 = $.child(div_1);

	{
		const children = ($$anchor, $$arg0) => {
			let tickItems = () => ($$arg0?.()).tickItems;
			var fragment_4 = root_2();
			var span_1 = $.first_child(fragment_4);
			var node_7 = $.child(span_1);

			$.component(node_7, () => Slider.Range, ($$anchor, Slider_Range_1) => {
				Slider_Range_1($$anchor, { class: 'bg-foreground absolute w-full' });
			});

			$.reset(span_1);

			var node_8 = $.sibling(span_1, 2);

			$.component(node_8, () => Slider.Thumb, ($$anchor, Slider_Thumb_1) => {
				Slider_Thumb_1($$anchor, {
					index: 0,
					class: 'border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
				});
			});

			var node_9 = $.sibling(node_8, 2);

			$.each(node_9, 17, tickItems, ({ index, value }) => index, ($$anchor, $$item) => {
				let index = () => $.get($$item).index;
				let value = () => $.get($$item).value;
				var fragment_5 = root();
				var node_10 = $.first_child(fragment_5);

				$.component(node_10, () => Slider.Tick, ($$anchor, Slider_Tick_1) => {
					Slider_Tick_1($$anchor, {
						get index() {
							return index();
						},
						class: 'dark:bg-background z-1 h-[1px] w-4'
					});
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => Slider.TickLabel, ($$anchor, Slider_TickLabel_1) => {
					Slider_TickLabel_1($$anchor, {
						get index() {
							return index();
						},
						class: 'text-muted-foreground data-selected:text-foreground mr-5 text-sm font-medium leading-none',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, `${value() ?? ''}px`));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		};

		$.component(node_6, () => Slider.Root, ($$anchor, Slider_Root_1) => {
			Slider_Root_1($$anchor, {
				type: 'single',
				get step() {
					return fontSizes;
				},
				orientation: 'vertical',
				class: 'relative flex h-full touch-none select-none flex-col items-center',
				trackPadding: 3,
				get value() {
					return $.get(fontSize);
				},

				set value($$value) {
					$.set(fontSize, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.reset(div_1);
	$.append($$anchor, fragment);
}