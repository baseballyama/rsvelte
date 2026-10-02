import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "bits-ui";
import { cn } from "$lib/utils/styles.js";

var root = $.from_html(`<span class="bg-dark-10 relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full"><!></span> <!>`, 1);
var root_1 = $.from_html(`<div class="w-full md:max-w-[280px]"><!></div>`);

export default function Slider_demo($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(50);
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Slider.Root, ($$anchor, Slider_Root) => {
		Slider_Root($$anchor, {
			type: 'single',
			class: 'relative flex w-full touch-none select-none items-center',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var span = $.first_child(fragment);
				var node_1 = $.child(span);

				$.component(node_1, () => Slider.Range, ($$anchor, Slider_Range) => {
					Slider_Range($$anchor, { class: 'bg-foreground absolute h-full' });
				});

				$.reset(span);

				var node_2 = $.sibling(span, 2);

				{
					let $0 = $.derived(() => cn("border-border-input bg-background hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"));

					$.component(node_2, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
						Slider_Thumb($$anchor, {
							index: 0,
							get class() {
								return $.get($0);
							}
						});
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}