import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Accordion } from "melt/builders";
import { slide } from "svelte/transition";

var root = $.from_html(`<div><div class="p-2"> </div></div>`);
var root_1 = $.from_html(`<div class="overflow-hidden first:rounded-t-xl last:rounded-b-xl"><h2><div aria-hidden="true"></div> <button> </button></h2> <!></div>`);
var root_2 = $.from_html(`<div></div>`);

export default function Accordion_1($$anchor, $$props) {
	$.push($$props, true);

	const controls = usePreviewControls({
		multiple: { type: "boolean", defaultValue: false, label: "Multiple" },
		disabled: { type: "boolean", defaultValue: false, label: "Disabled" }
	});

	const items = [
		{
			id: "item-1",
			title: "What is it?",
			description: "A collection of accessible & unstyled component builders for Svelte applications."
		},

		{
			id: "item-2",
			title: "Can I customize it?",
			description: "Totally, it is 100% stylable and overridable."
		},

		{
			id: "item-3",
			title: "Svelte is awesome, huh?",
			description: "Yes, and so are you!"
		}
	];

	const accordion = new Accordion(getters(controls));

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_2();

			$.attribute_effect(
				div,
				() => ({
					...accordion.root,
					class: 'mx-auto w-[18rem] max-w-full rounded-xl shadow-lg sm:w-[25rem]'
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1y3lud5'
			);

			$.each(div, 21, () => items, $.index, ($$anchor, i, idx) => {
				const item = $.derived(() => accordion.getItem($.get(i)));
				const isFirst = $.derived(() => idx === 0);
				const isLast = $.derived(() => idx === items.length - 1);
				var div_1 = root_1();
				var h2 = $.child(div_1);

				$.attribute_effect(h2, () => ({ class: 'relative flex', ...$.get(item).heading }), void 0, void 0, void 0, 'svelte-1y3lud5');

				var div_2 = $.child(h2);
				var button = $.sibling(div_2, 2);

				$.attribute_effect(
					button,
					() => ({
						...$.get(item).trigger,
						class: [
							"flex flex-1 cursor-pointer items-center justify-between bg-gray-200 px-5 py-5 text-base font-medium leading-none text-gray-800 outline-none transition-colors",
							!$.get(item).isDisabled && "hover:bg-gray-300 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50",
							"disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50",
							"dark:bg-gray-800 dark:text-gray-200 ",
							!$.get(isLast) && "border-b border-neutral-200 dark:border-neutral-700"
						]
					}),
					void 0,
					void 0,
					void 0,
					'svelte-1y3lud5'
				);

				var text = $.only_child(button, true);

				$.reset(h2);

				var node = $.sibling(h2, 2);

				{
					var consequent = ($$anchor) => {
						var div_3 = root();

						$.attribute_effect(
							div_3,
							() => ({
								...$.get(item).content,
								class: 'content overflow-hidden bg-white p-4 text-sm dark:bg-gray-900 dark:text-white/80'
							}),
							void 0,
							void 0,
							void 0,
							'svelte-1y3lud5'
						);

						var div_4 = $.child(div_3);
						var text_1 = $.only_child(div_4, true);

						$.reset(div_3);
						$.template_effect(() => $.set_text(text_1, $.get(item).item.description));
						$.transition(3, div_3, () => slide, () => ({ duration: 250 }));
						$.append($$anchor, div_3);
					};

					$.if(node, ($$render) => {
						if ($.get(item).isExpanded) $$render(consequent);
					});
				}

				$.reset(div_1);

				$.template_effect(() => {
					$.set_class(
						div_2,
						1,
						$.clsx([
							"border-accent-500 focus-ring absolute inset-0 z-10 border-4 transition-all",
							$.get(isFirst) && "rounded-t-xl",
							$.get(isLast) && !$.get(item).isExpanded && "rounded-b-xl"
						]),
						'svelte-1y3lud5'
					);

					$.set_text(text, $.get(item).item.title);
				});

				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}