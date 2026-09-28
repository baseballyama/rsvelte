import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import Loader2Icon from "@lucide/svelte/icons/loader-2";

export default function Spinner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		Loader2Icon($$renderer, $.spread_props([
			{
				role: 'status',
				'aria-label': 'Loading',
				class: cn("size-4 animate-spin", className)
			},
			restProps
		]));
	});
}