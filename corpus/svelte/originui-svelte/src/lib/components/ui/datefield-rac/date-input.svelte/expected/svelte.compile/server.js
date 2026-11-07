import * as $ from 'svelte/internal/server';
import DateSegment from './date-segment.svelte';
import { cn } from '$lib/utils';
import { DateField } from 'bits-ui';

export default function Date_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			unstyled = false,
			$$slots,
			$$events,
			...props
		} = $$props;

		{
			function children($$renderer, { segments }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(segments);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let segment = each_array[i];

					DateSegment($$renderer, { segment });
				}

				$$renderer.push(`<!--]-->`);
			}

			if (DateField.Input) {
				$$renderer.push('<!--[-->');

				DateField.Input($$renderer, $.spread_props([
					props,
					{
						class: cn(!unstyled && 'border-input bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:has-aria-invalid:ring-destructive/20 dark:focus-within:has-aria-invalid:ring-destructive/40 focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-within:ring-[3px]', className),
						children,
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}
	});
}