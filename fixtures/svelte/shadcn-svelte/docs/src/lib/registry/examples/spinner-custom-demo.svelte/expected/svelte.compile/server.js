import * as $ from 'svelte/internal/server';
import LoaderIcon from "@lucide/svelte/icons/loader";
import { cn } from "$lib/utils.js";

export default function Spinner_custom_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		LoaderIcon($$renderer, $.spread_props([
			{
				role: 'status',
				'aria-label': 'Loading',
				class: cn("size-4 animate-spin", className)
			},
			restProps
		]));
	});
}