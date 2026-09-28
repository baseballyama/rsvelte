import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import Loader2Icon from '@lucide/svelte/icons/loader-2';

export default function Spinner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			role = 'status',
			// we add name, color, and stroke for compatibility with different icon libraries props
			name,
			color,
			stroke,
			'aria-label': ariaLabel = 'Loading',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		Loader2Icon($$renderer, $.spread_props([
			{
				role,
				name: name === null ? undefined : name,
				color: color === null ? undefined : color,
				stroke: stroke === null ? undefined : stroke,
				'aria-label': ariaLabel,
				class: cn('size-4 animate-spin', className)
			},
			restProps
		]));
	});
}