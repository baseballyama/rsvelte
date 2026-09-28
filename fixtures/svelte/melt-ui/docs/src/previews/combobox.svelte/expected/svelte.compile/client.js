import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Combobox } from "melt/builders";
import AlphabetJapanese from "~icons/hugeicons/alphabet-japanese";
import Check from "~icons/lucide/check";
import ChevronDown from "~icons/lucide/chevron-down";
import { ascii } from "./ascii";

var root = $.from_html(`<div><span> </span> <!></div>`);
var root_1 = $.from_html(`<span class="opacity-50 py-2 pl-8 pr-2">No results found</span>`);
var root_2 = $.from_html(`<div class="mx-auto flex w-[300px] flex-col gap-1"><label>Favorite Character</label> <div class="relative text-left text-gray-800 transition dark:text-gray-200"><!> <input/> <button><!></button></div> <span> </span> <div></div></div>`);

export default function Combobox_1($$anchor, $$props) {
	$.push($$props, true);

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

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var label = $.child(div);

			$.attribute_effect(label, () => ({ ...combobox.label }), void 0, void 0, void 0, 'svelte-1ldzhpo');

			var div_1 = $.sibling(label, 2);
			var node = $.child(div_1);

			AlphabetJapanese(node, { class: 'abs-y-center absolute left-3 shrink-0' });

			var input = $.sibling(node, 2);

			$.attribute_effect(
				input,
				() => ({
					...combobox.input,
					class: 'w-full rounded-xl border border-gray-500 bg-gray-100 py-2 pl-9 text-left\n					disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50\n					dark:bg-gray-900',
					type: 'text'
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1ldzhpo',
				true
			);

			var button = $.sibling(input, 2);

			$.attribute_effect(
				button,
				() => ({
					class: 'abs-y-center absolute right-3 grid shrink-0 place-items-center rounded-md\n					dark:bg-gray-700 dark:hover:bg-gray-500 dark:active:bg-gray-600',
					...combobox.trigger
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1ldzhpo'
			);

			var node_1 = $.child(button);

			ChevronDown(node_1, {});
			$.reset(button);
			$.reset(div_1);

			var span = $.sibling(div_1, 2);
			var text = $.only_child(span);
			var div_2 = $.sibling(span, 2);

			$.attribute_effect(
				div_2,
				() => ({
					...combobox.content,
					class: 'flex max-h-96 flex-col rounded-xl border border-gray-500 bg-gray-100 p-2 shadow dark:bg-gray-800'
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1ldzhpo'
			);

			$.each(
				div_2,
				20,
				() => $.get(filtered),
				(option) => option,
				($$anchor, option) => {
					var div_3 = root();

					$.attribute_effect(
						div_3,
						($0) => ({
							...$0,
							class: [
								"relative flex scroll-m-2 items-center justify-between rounded-xl py-2 pl-8 pr-2",
								combobox.highlighted === option && "bg-gray-700",
								combobox.value === option && "font-semibold"
							]
						}),
						[() => combobox.getOption(option)],
						void 0,
						void 0,
						'svelte-1ldzhpo'
					);

					var span_1 = $.child(div_3);
					var text_1 = $.only_child(span_1, true);
					var node_2 = $.sibling(span_1, 2);

					{
						var consequent = ($$anchor) => {
							Check($$anchor, { class: 'text-accent-300 font-bold' });
						};

						var d = $.derived(() => combobox.isSelected(option));

						$.if(node_2, ($$render) => {
							if ($.get(d)) $$render(consequent);
						});
					}

					$.reset(div_3);
					$.template_effect(() => $.set_text(text_1, option));
					$.append($$anchor, div_3);
				},
				($$anchor) => {
					var span_2 = root_1();

					$.append($$anchor, span_2);
				}
			);

			$.reset(div_2);
			$.reset(div);

			$.template_effect(() => {
				$.set_class(span, 1, $.clsx([
					"text-sm opacity-75",
					!(combobox.multiple && combobox.valueAsString) && "pointer-events-none invisible"
				]));

				$.set_text(text, `Selected: ${combobox.valueAsString ?? ''}`);
			});

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}