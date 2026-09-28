import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Select } from "melt/builders";
import AlphabetJapanese from "~icons/hugeicons/alphabet-japanese";
import Check from "~icons/lucide/check";
import ChevronDown from "~icons/lucide/chevron-down";

var root = $.from_html(`<div><span> </span> <!></div>`);
var root_1 = $.from_html(`<div class="mx-auto flex w-[300px] flex-col gap-1"><label>Anime</label> <button><div class="inline-flex items-center gap-2 overflow-hidden"><!> <span class="truncate"> </span></div> <!></button> <div></div></div>`);

export default function Select_1($$anchor, $$props) {
	$.push($$props, true);

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

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var label = $.child(div);

			$.attribute_effect(label, () => ({ ...select.label }), void 0, void 0, void 0, 'svelte-1ctrcbj');

			var button = $.sibling(label, 2);

			$.attribute_effect(
				button,
				() => ({
					...select.trigger,
					class: 'flex items-center justify-between overflow-hidden rounded-xl border border-gray-500 bg-gray-100 py-2 pl-3 pr-4 text-left text-gray-800\n				transition hover:cursor-pointer hover:bg-gray-200\n				active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50\n				dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-500/50 dark:active:bg-gray-600/50'
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1ctrcbj'
			);

			var div_1 = $.child(button);
			var node = $.child(div_1);

			AlphabetJapanese(node, { class: 'shrink-0' });

			var span = $.sibling(node, 2);
			var text = $.only_child(span, true);

			$.reset(div_1);

			var node_1 = $.sibling(div_1, 2);

			ChevronDown(node_1, { class: 'shrink-0' });
			$.reset(button);

			var div_2 = $.sibling(button, 2);

			$.attribute_effect(
				div_2,
				() => ({
					...select.content,
					class: 'flex flex-col rounded-xl border border-gray-500 bg-gray-100 p-2 shadow dark:bg-gray-800'
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1ctrcbj'
			);

			$.each(div_2, 21, () => options, $.index, ($$anchor, option) => {
				var div_3 = root();

				$.attribute_effect(
					div_3,
					($0) => ({
						...$0,
						class: [
							"relative flex items-center justify-between rounded-xl py-2 pl-8 pr-2",
							select.highlighted === $.get(option).value && "bg-gray-700",
							select.value === $.get(option).value && "font-semibold"
						]
					}),
					[
						() => select.getOption($.get(option).value, $.get(option).label)
					],
					void 0,
					void 0,
					'svelte-1ctrcbj'
				);

				var span_1 = $.child(div_3);
				var text_1 = $.only_child(span_1, true);
				var node_2 = $.sibling(span_1, 2);

				{
					var consequent = ($$anchor) => {
						Check($$anchor, { class: 'text-accent-300 font-bold' });
					};

					var d = $.derived(() => select.isSelected($.get(option).value));

					$.if(node_2, ($$render) => {
						if ($.get(d)) $$render(consequent);
					});
				}

				$.reset(div_3);
				$.template_effect(() => $.set_text(text_1, $.get(option).label));
				$.append($$anchor, div_3);
			});

			$.reset(div_2);
			$.reset(div);
			$.template_effect(() => $.set_text(text, select.valueAsString || "Select an anime"));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}