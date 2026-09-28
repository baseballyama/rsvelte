import * as $ from 'svelte/internal/server';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { PinInput } from "melt/builders";

export default function Pin_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attributes({
					...pinInput.root,
					class: 'flex items-center justify-center gap-2 font-mono'
				})}><!--[-->`);

				const each_array = $.ensure_array_like(pinInput.inputs);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let input = each_array[$$index];

					$$renderer.push(`<input${$.attributes(
						{
							class: 'focus:border-accent-500 size-12 rounded-xl border-2 border-gray-300 bg-white text-center outline-none transition hover:border-gray-400 disabled:cursor-not-allowed dark:border-gray-400/50 dark:bg-gray-900 dark:hover:border-gray-400 dark:focus:border-gray-300',
							...input
						},
						void 0,
						void 0,
						void 0,
						4
					)}/>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}