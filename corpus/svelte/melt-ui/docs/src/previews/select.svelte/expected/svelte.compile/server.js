import * as $ from 'svelte/internal/server';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Select } from "melt/builders";
import AlphabetJapanese from "~icons/hugeicons/alphabet-japanese";
import Check from "~icons/lucide/check";
import ChevronDown from "~icons/lucide/chevron-down";

export default function Select_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const controls = usePreviewControls({
			multiple: { type: "boolean", defaultValue: false, label: "Multiple" },
			disabled: { type: "boolean", defaultValue: false, label: "Disabled" }
		});

		const options = [
			{ value: "Solo Leveling", label: "Solo Leveling" },
			{ value: "Bleach", label: "Bleach" },
			{ value: "Dan da Dan", label: "Dan da Dan" },
			{ value: "Re: Zero", label: "Re: Zero" },
			{ value: "Jujutsu Kaisen", label: "Jujutsu Kaisen" },
			{ value: "Attack on Titan", label: "Attack on Titan" },
			{ value: "Death Note", label: "Death Note" }
		];

		const select = new Select({ forceVisible: true, ...getters(controls) });

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="mx-auto flex w-[300px] flex-col gap-1"><label${$.attributes({ ...select.label }, 'svelte-1ctrcbj')}>Anime</label> <button${$.attributes(
					{
						...select.trigger,
						class: 'flex items-center justify-between overflow-hidden rounded-xl border border-gray-500 bg-gray-100 py-2 pl-3 pr-4 text-left text-gray-800 transition hover:cursor-pointer hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50'
					},
					'svelte-1ctrcbj'
				)}><div class="inline-flex items-center gap-2 overflow-hidden">`);

				AlphabetJapanese($$renderer, { class: 'shrink-0' });
				$$renderer.push(`<!----> <span class="truncate">${$.escape(select.valueAsString || "Select an anime")}</span></div> `);
				ChevronDown($$renderer, { class: 'shrink-0' });

				$$renderer.push(`<!----></button> <div${$.attributes(
					{
						...select.content,
						class: 'flex flex-col rounded-xl border border-gray-500 bg-gray-100 p-2 shadow dark:bg-gray-800'
					},
					'svelte-1ctrcbj'
				)}><!--[-->`);

				const each_array = $.ensure_array_like(options);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let option = each_array[$$index];

					$$renderer.push(`<div${$.attributes(
						{
							...select.getOption(option.value, option.label),
							class: $.clsx([
								"relative flex items-center justify-between rounded-xl py-2 pl-8 pr-2",
								select.highlighted === option.value && "bg-gray-700",
								select.value === option.value && "font-semibold"
							])
						},
						'svelte-1ctrcbj'
					)}><span>${$.escape(option.label)}</span> `);

					if (select.isSelected(option.value)) {
						$$renderer.push('<!--[0-->');
						Check($$renderer, { class: 'text-accent-300 font-bold' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}