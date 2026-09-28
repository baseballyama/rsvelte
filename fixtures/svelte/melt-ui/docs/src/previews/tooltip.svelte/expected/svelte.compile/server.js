import * as $ from 'svelte/internal/server';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Tooltip } from "melt/builders";
import PhChefHatFill from "~icons/ph/chef-hat-fill";

export default function Tooltip_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let controls = usePreviewControls({
			closeOnPointerDown: {
				label: "Close on pointer down",
				type: "boolean",
				defaultValue: true
			},
			disableHoverableContent: {
				label: "Disable hoverable content",
				type: "boolean",
				defaultValue: false
			},
			placement: {
				label: "Placement",
				type: "select",
				options: ["top", "bottom", "left", "right"],
				defaultValue: "top"
			},
			openDelay: { label: "Open delay", type: "number", defaultValue: 100 },
			closeDelay: { label: "Close delay", type: "number", defaultValue: 0 }
		});

		const computePositionOptions = $.derived(() => ({ computePosition: { placement: controls.placement } }));

		const tooltip = new Tooltip({
			...getters(controls),
			forceVisible: true,
			floatingConfig: () => computePositionOptions()
		});

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<button${$.attributes(
					{
						type: 'button',
						class: 'mx-auto grid size-12 place-items-center rounded-xl text-white transition dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600',
						'aria-label': 'Add',
						...tooltip.trigger
					},
					'svelte-23mhte'
				)}>`);

				PhChefHatFill($$renderer, { 'aria-label': 'Plus' });

				$$renderer.push(`<!----></button> <div${$.attributes(
					{
						...tooltip.content,
						class: 'rounded-xl bg-white p-0 shadow-xl dark:bg-gray-800'
					},
					'svelte-23mhte'
				)}><div${$.attributes({ ...tooltip.arrow, class: 'size-2 rounded-tl' }, 'svelte-23mhte')}></div> <p class="px-4 py-1 text-gray-700 dark:text-white">Let us cook!</p></div>`);
			},
			$$slots: { default: true }
		});
	});
}