import * as $ from 'svelte/internal/server';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { RadioGroup } from "melt/builders";

export default function Radio_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = ["default", "comfortable", "compact"];

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

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attributes({ class: 'mx-auto flex w-fit flex-col gap-2', ...group.root })}><label${$.attributes({ ...group.label, class: 'font-medium' })}>Layout</label> <div${$.attr_class(`flex ${isVert() ? 'flex-col gap-1' : 'flex-row gap-3'}`)}><!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let i = each_array[$$index];
					const item = group.getItem(i);

					$$renderer.push(`<div${$.attributes({
						class: 'ring-accent-500 -ml-1 flex items-center gap-3 rounded p-1 outline-none focus-visible:ring data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
						...item.attrs
					})}><div${$.attr_class($.clsx([
						"grid h-6 w-6 place-items-center rounded-full border shadow-sm",
						"hover:bg-gray-100 data-[disabled=true]:bg-gray-400",
						item.checked
							? "bg-accent-500 border-accent-500 dark:bg-white"
							: "border-neutral-400 bg-neutral-100",
						"dark:border-white"
					]))}>`);

					if (item.checked) {
						$$renderer.push(`<!--[0--><div${$.attr_class($.clsx([
							"h-3 w-3 rounded-full",
							item.checked && "dark:bg-accent-500 bg-white"
						]))} aria-hidden="true"></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <span class="font-semibold capitalize leading-none text-gray-600 dark:text-gray-100">${$.escape(i)}</span></div>`);
				}

				$$renderer.push(`<!--]--></div> <input${$.attributes({ ...group.hiddenInput }, void 0, void 0, void 0, 4)}/></div>`);
			},
			$$slots: { default: true }
		});
	});
}