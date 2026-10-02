import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Native_select_option($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.option(
			{
				this: ref,
				'data-slot': 'native-select-option',
				class: cn("bg-[Canvas] text-[CanvasText]", className),
				...restProps
			},
			($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);

		$.bind_props($$props, { ref });
	});
}