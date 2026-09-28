import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Preview from "@components/preview.svelte";
import { usePreviewControls } from "@components/preview-ctx.svelte";
import { Toggle } from "melt/builders";
import { spring } from "svelte/motion";
import PhHeartBold from "~icons/ph/heart-bold";
import PhHeartFill from "~icons/ph/heart-fill";

var root = $.from_html(`<div class="flex justify-center"><button><!> <!></button></div>`);

export default function Toggle_1($$anchor, $$props) {
	$.push($$props, true);

	const $scale = () => $.store_get(scale, '$scale', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const controls = usePreviewControls({
		disabled: { label: "Disabled", type: "boolean", defaultValue: false }
	});

	const toggle = new Toggle({ disabled: () => controls.disabled });
	const scale = spring(0, { damping: 0.205, stiffness: 0.07, precision: 0.03 });

	$.user_effect(() => {
		scale.set(toggle.value ? 1 : 0);
	});

	const absScale = $.derived(() => Math.max(0, $scale()));

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var button = $.child(div);

			$.attribute_effect(button, () => ({
				class: 'focus-visible:ring-accent-300 relative size-16 rounded-xl bg-transparent\n				text-xl outline-none transition-all hover:cursor-pointer\n			  hover:bg-gray-300/25 focus-visible:ring active:bg-gray-300/40 disabled:cursor-not-allowed\n				dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:disabled:bg-gray-900',
				...toggle.trigger,
				'aria-label': 'toggle favourite'
			}));

			var node = $.child(button);

			PhHeartFill(node, {
				class: 'text-accent-500 dark:text-accent-200 absolute left-1/2 top-1/2 z-10 origin-center -translate-x-1/2 -translate-y-1/2',
				get style() {
					return `scale: ${$.get(absScale) ?? ''}`;
				}
			});

			var node_1 = $.sibling(node, 2);

			PhHeartBold(node_1, {
				class: 'absolute left-1/2 top-1/2  -translate-x-1/2 -translate-y-1/2 opacity-30'
			});

			$.reset(button);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}