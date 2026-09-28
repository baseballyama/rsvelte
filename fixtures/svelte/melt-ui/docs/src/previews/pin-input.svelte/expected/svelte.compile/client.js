import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { PinInput } from "melt/builders";

var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<div></div>`);

export default function Pin_input($$anchor, $$props) {
	$.push($$props, true);

	const controls = usePreviewControls({
		maxLength: {
			label: "Max length",
			defaultValue: 4,
			type: "number",
			min: 1,
			max: 8
		},
		type: {
			label: "Type",
			type: "select",
			options: ["alphanumeric", "numeric", "text"],
			defaultValue: "alphanumeric"
		},
		mask: { label: "Mask", type: "boolean", defaultValue: false },
		disabled: { label: "Disabled", type: "boolean", defaultValue: false },
		allowPaste: { label: "Allow paste", type: "boolean", defaultValue: true }
	});

	const pinInput = new PinInput({
		...getters(controls),
		onValueChange(v) {
			pinInput.value = v.toUpperCase();
		},

		onComplete(v) {
			console.log("Yay!", v);
		}
	});

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();

			$.attribute_effect(div, () => ({
				...pinInput.root,
				class: 'flex items-center justify-center gap-2 font-mono'
			}));

			$.each(div, 21, () => pinInput.inputs, $.index, ($$anchor, input) => {
				var input_1 = root();

				$.attribute_effect(
					input_1,
					() => ({
						class: 'focus:border-accent-500 size-12 rounded-xl border-2 border-gray-300 bg-white text-center\n				outline-none transition hover:border-gray-400 disabled:cursor-not-allowed\n				dark:border-gray-400/50 dark:bg-gray-900 dark:hover:border-gray-400 dark:focus:border-gray-300',
						...$.get(input)
					}),
					void 0,
					void 0,
					void 0,
					void 0,
					true
				);

				$.append($$anchor, input_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}