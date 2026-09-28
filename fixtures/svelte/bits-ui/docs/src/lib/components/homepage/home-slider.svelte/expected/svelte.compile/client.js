import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from "bits-ui";
import { cn } from "$lib/utils/styles.js";

var root = $.from_html(`<span class="bg-dark/10 relative h-[6px] w-full grow overflow-hidden rounded-full lg:h-2"><!></span> <!>`, 1);
var root_1 = $.from_html(`<div class="w-full"><!></div>`);

export default function Home_slider($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, 5);
	var div = root_1();
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let thumbItems = () => ($$arg0?.()).thumbItems;
			var fragment = root();
			var span = $.first_child(fragment);
			var node_1 = $.child(span);

			$.component(node_1, () => Slider.Range, ($$anchor, Slider_Range) => {
				Slider_Range($$anchor, { class: 'bg-dark absolute h-full dark:bg-[#18181B]' });
			});

			$.reset(span);

			var node_2 = $.sibling(span, 2);

			$.each(node_2, 17, thumbItems, ({ index }) => index, ($$anchor, $$item) => {
				let index = () => $.get($$item).index;
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn("bg-background shadow-mini hover:border-dark-40 dark:bg-foreground focus-visible:outline-hidden block size-[18px] cursor-pointer rounded-full transition-colors  active:scale-[0.98] lg:size-[25px] dark:shadow-[0px_0.7px_0px_0.7px_rgba(0,_0,_0,_0.04);]"));

					$.component(node_3, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
						Slider_Thumb($$anchor, {
							get index() {
								return index();
							},

							get class() {
								return $.get($0);
							},
							'aria-label': 'Speed'
						});
					});
				}

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => Slider.Root, ($$anchor, Slider_Root) => {
			Slider_Root($$anchor, {
				type: 'single',
				get value() {
					return value();
				},
				onValueCommit: (v) => value(v),
				class: 'shadow-mini-inset relative flex w-full touch-none select-none items-center rounded-full dark:bg-[rgba(244,244,245,0.1)] dark:shadow-[0px_0.7px_0px_0px_rgba(0,_0,_0,_0.04)_inset]',
				children,
				$$slots: { default: true }
			});
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}