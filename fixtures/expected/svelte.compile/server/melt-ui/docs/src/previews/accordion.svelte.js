import * as $ from 'svelte/internal/server';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Accordion } from "melt/builders";
import { slide } from "svelte/transition";

export default function Accordion_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attributes(
					{
						...accordion.root,
						class: 'mx-auto w-[18rem] max-w-full rounded-xl shadow-lg sm:w-[25rem]'
					},
					'svelte-1y3lud5'
				)}><!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
					let i = each_array[idx];
					const item = accordion.getItem(i);
					const isFirst = idx === 0;
					const isLast = idx === items.length - 1;

					$$renderer.push(`<div class="overflow-hidden first:rounded-t-xl last:rounded-b-xl"><h2${$.attributes({ class: 'relative flex', ...item.heading }, 'svelte-1y3lud5')}><div${$.attr_class(
						$.clsx([
							"border-accent-500 focus-ring absolute inset-0 z-10 border-4 transition-all",
							isFirst && "rounded-t-xl",
							isLast && !item.isExpanded && "rounded-b-xl"
						]),
						'svelte-1y3lud5'
					)} aria-hidden="true"></div> <button${$.attributes(
						{
							...item.trigger,
							class: $.clsx([
								"flex flex-1 cursor-pointer items-center justify-between bg-gray-200 px-5 py-5 text-base font-medium leading-none text-gray-800 outline-none transition-colors",
								!item.isDisabled && "hover:bg-gray-300 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50",
								"disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50",
								"dark:bg-gray-800 dark:text-gray-200 ",
								!isLast && "border-b border-neutral-200 dark:border-neutral-700"
							])
						},
						'svelte-1y3lud5'
					)}>${$.escape(item.item.title)}</button></h2> `);

					if (item.isExpanded) {
						$$renderer.push(`<!--[0--><div${$.attributes(
							{
								...item.content,
								class: 'content overflow-hidden bg-white p-4 text-sm dark:bg-gray-900 dark:text-white/80'
							},
							'svelte-1y3lud5'
						)}><div class="p-2">${$.escape(item.item.description)}</div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}