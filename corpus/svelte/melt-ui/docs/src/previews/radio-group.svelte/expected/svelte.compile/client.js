import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { RadioGroup } from "melt/builders";

var root = $.from_html(`<div aria-hidden="true"></div>`);
var root_1 = $.from_html(`<div><div><!></div> <span class="font-semibold capitalize leading-none text-gray-600 dark:text-gray-100"> </span></div>`);
var root_2 = $.from_html(`<div><label>Layout</label> <div></div> <input/></div>`);

export default function Radio_group($$anchor, $$props) {
	$.push($$props, true);

	const items = $.proxy(["default", "comfortable", "compact"]);

	let controls = usePreviewControls({
		value: {
			type: "select",
			label: "Value",
			options: items,
			defaultValue: "default"
		},
		disabled: { type: "boolean", label: "Disabled", defaultValue: false },
		loop: { type: "boolean", label: "Loop", defaultValue: true },
		selectWhenFocused: {
			type: "boolean",
			label: "Select when focused",
			defaultValue: true
		},
		orientation: {
			type: "select",
			label: "Orientation",
			options: ["horizontal", "vertical"],
			defaultValue: "vertical"
		}
	});

	const group = new RadioGroup({
		...getters(controls),
		onValueChange(v) {
			controls.value = v;
		}
	});

	const isVert = $.derived(() => group.orientation === "vertical");

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_2();

			$.attribute_effect(div, () => ({ class: 'mx-auto flex w-fit flex-col gap-2', ...group.root }));

			var label = $.child(div);

			$.attribute_effect(label, () => ({ ...group.label, class: 'font-medium' }));

			var div_1 = $.sibling(label, 2);

			$.each(div_1, 21, () => items, $.index, ($$anchor, i) => {
				const item = $.derived(() => group.getItem($.get(i)));
				var div_2 = root_1();

				$.attribute_effect(div_2, () => ({
					class: 'ring-accent-500 -ml-1 flex items-center gap-3 rounded p-1 outline-none focus-visible:ring\n					data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
					...$.get(item).attrs
				}));

				var div_3 = $.child(div_2);
				var node = $.child(div_3);

				{
					var consequent = ($$anchor) => {
						var div_4 = root();

						$.template_effect(() => $.set_class(div_4, 1, $.clsx([
							"h-3 w-3 rounded-full",
							$.get(item).checked && "dark:bg-accent-500 bg-white"
						])));

						$.append($$anchor, div_4);
					};

					$.if(node, ($$render) => {
						if ($.get(item).checked) $$render(consequent);
					});
				}

				$.reset(div_3);

				var span = $.sibling(div_3, 2);
				var text = $.only_child(span, true);

				$.reset(div_2);

				$.template_effect(() => {
					$.set_class(div_3, 1, $.clsx([
						"grid h-6 w-6 place-items-center rounded-full border shadow-sm",
						"hover:bg-gray-100 data-[disabled=true]:bg-gray-400",
						$.get(item).checked
							? "bg-accent-500 border-accent-500 dark:bg-white"
							: "border-neutral-400 bg-neutral-100",
						"dark:border-white"
					]));

					$.set_text(text, $.get(i));
				});

				$.append($$anchor, div_2);
			});

			$.reset(div_1);

			var input = $.sibling(div_1, 2);

			$.attribute_effect(input, () => ({ ...group.hiddenInput }), void 0, void 0, void 0, void 0, true);
			$.reset(div);
			$.template_effect(() => $.set_class(div_1, 1, `flex ${$.get(isVert) ? 'flex-col gap-1' : 'flex-row gap-3'}`));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}