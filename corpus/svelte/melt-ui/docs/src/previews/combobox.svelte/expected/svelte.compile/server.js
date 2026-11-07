import * as $ from 'svelte/internal/server';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Combobox } from "melt/builders";
import AlphabetJapanese from "~icons/hugeicons/alphabet-japanese";
import Check from "~icons/lucide/check";
import ChevronDown from "~icons/lucide/chevron-down";
import { ascii } from "./ascii";

export default function Combobox_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const controls = usePreviewControls({
			multiple: { type: "boolean", defaultValue: false, label: "Multiple" },
			disabled: { type: "boolean", defaultValue: false, label: "Disabled" }
		});

		const options = [
			"Sung Jinwoo",
			"Ichigo Kurosaki",
			"Guts",
			"Light Yagami",
			"Naruto Uzumaki",
			"Goku",
			"Eren Jaeger",
			"Monkey D. Luffy",
			"Seto Kaiba",
			"Spike Spiegel",
			"Edward Elric",
			"Levi Ackerman",
			"Natsu Dragneel",
			"Gon Freecss",
			"Killua Zoldyck",
			"Lelouch Lamperouge",
			"Kira",
			"Saitama",
			"Vegeta",
			"Hisoka Morow",
			"Itachi Uchiha",
			"Kakashi Hatake",
			"Roronoa Zoro",
			"Ken Kaneki",
			"Meliodas",
			"Tanjiro Kamado",
			"Alucard",
			"Roy Mustang",
			"L Lawliet",
			"Yami Sukehiro",
			"Satoru Gojo",
			"Mob",
			"Yusuke Urameshi",
			"Jotaro Kujo",
			"Dio Brando"
		].toSorted();

		const combobox = new Combobox({
			forceVisible: true,
			onValueChange(option) {
				if (option !== "Sung Jinwoo") {
					console.log("I bet Sung Jinwoo could beat", option);
				} else {
					console.log(ascii.jinwoo);
				}
			},
			...getters(controls)
		});

		const filtered = $.derived(() => {
			if (!combobox.touched) return options;

			return options.filter((o) => o.toLowerCase().includes(combobox.inputValue.trim().toLowerCase()));
		});

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="mx-auto flex w-[300px] flex-col gap-1"><label${$.attributes({ ...combobox.label }, 'svelte-1ldzhpo')}>Favorite Character</label> <div class="relative text-left text-gray-800 transition dark:text-gray-200">`);
				AlphabetJapanese($$renderer, { class: 'abs-y-center absolute left-3 shrink-0' });

				$$renderer.push(`<!----> <input${$.attributes(
					{
						...combobox.input,
						class: 'w-full rounded-xl border border-gray-500 bg-gray-100 py-2 pl-9 text-left disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:bg-gray-900',
						type: 'text'
					},
					'svelte-1ldzhpo',
					void 0,
					void 0,
					4
				)}/> <button${$.attributes(
					{
						class: 'abs-y-center absolute right-3 grid shrink-0 place-items-center rounded-md dark:bg-gray-700 dark:hover:bg-gray-500 dark:active:bg-gray-600',
						...combobox.trigger
					},
					'svelte-1ldzhpo'
				)}>`);

				ChevronDown($$renderer, {});

				$$renderer.push(`<!----></button></div> <span${$.attr_class($.clsx([
					"text-sm opacity-75",
					!(combobox.multiple && combobox.valueAsString) && "pointer-events-none invisible"
				]))}>Selected: ${$.escape(combobox.valueAsString)}</span> <div${$.attributes(
					{
						...combobox.content,
						class: 'flex max-h-96 flex-col rounded-xl border border-gray-500 bg-gray-100 p-2 shadow dark:bg-gray-800'
					},
					'svelte-1ldzhpo'
				)}>`);

				const each_array = $.ensure_array_like(filtered());

				if (each_array.length !== 0) {
					$$renderer.push('<!--[-->');

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let option = each_array[$$index];

						$$renderer.push(`<div${$.attributes(
							{
								...combobox.getOption(option),
								class: $.clsx([
									"relative flex scroll-m-2 items-center justify-between rounded-xl py-2 pl-8 pr-2",
									combobox.highlighted === option && "bg-gray-700",
									combobox.value === option && "font-semibold"
								])
							},
							'svelte-1ldzhpo'
						)}><span>${$.escape(option)}</span> `);

						if (combobox.isSelected(option)) {
							$$renderer.push('<!--[0-->');
							Check($$renderer, { class: 'text-accent-300 font-bold' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					}
				} else {
					$$renderer.push(`<!--[!--><span class="opacity-50 py-2 pl-8 pr-2">No results found</span>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}