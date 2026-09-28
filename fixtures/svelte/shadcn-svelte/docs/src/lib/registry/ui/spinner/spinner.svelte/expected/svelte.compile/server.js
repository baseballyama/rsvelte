import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Spinner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			role = "status",
			// we add name, color, and stroke for compatibility with different icon libraries props
			name,
			color,
			stroke,
			"aria-label": ariaLabel = "Loading",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		IconPlaceholder($$renderer, $.spread_props([
			{
				lucide: 'Loader2Icon',
				tabler: 'IconLoader',
				hugeicons: 'Loading03Icon',
				phosphor: 'SpinnerIcon',
				remixicon: 'RiLoaderLine',
				role,
				name: name === null ? undefined : name,
				color: color === null ? undefined : color,
				stroke: stroke === null ? undefined : stroke,
				'aria-label': ariaLabel,
				class: cn("size-4 animate-spin", className)
			},
			restProps
		]));
	});
}