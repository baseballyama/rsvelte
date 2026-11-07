import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters } from "melt";
import { Tooltip } from "melt/builders";
import PhChefHatFill from "~icons/ph/chef-hat-fill";

var root = $.from_html(`<button><!></button> <div><div></div> <p class="px-4 py-1 text-gray-700 dark:text-white">Let us cook!</p></div>`, 1);

export default function Tooltip_1($$anchor, $$props) {
	$.push($$props, true);

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
		floatingConfig: () => $.get(computePositionOptions)
	});

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var button = $.first_child(fragment_1);

			$.attribute_effect(
				button,
				() => ({
					type: 'button',
					class: 'mx-auto grid size-12 place-items-center rounded-xl text-white transition\n		dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600',
					'aria-label': 'Add',
					...tooltip.trigger
				}),
				void 0,
				void 0,
				void 0,
				'svelte-23mhte'
			);

			var node = $.child(button);

			PhChefHatFill(node, { 'aria-label': 'Plus' });
			$.reset(button);

			var div = $.sibling(button, 2);

			$.attribute_effect(
				div,
				() => ({
					...tooltip.content,
					class: 'rounded-xl bg-white p-0 shadow-xl dark:bg-gray-800'
				}),
				void 0,
				void 0,
				void 0,
				'svelte-23mhte'
			);

			var div_1 = $.child(div);

			$.attribute_effect(div_1, () => ({ ...tooltip.arrow, class: 'size-2 rounded-tl' }), void 0, void 0, void 0, 'svelte-23mhte');
			$.next(2);
			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}