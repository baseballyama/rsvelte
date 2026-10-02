import * as $ from 'svelte/internal/server';
import TimeSegment from './time-segment.svelte';
import { cn } from '$lib/utils';
import { TimeField } from 'bits-ui';

export default function Time_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			unstyled = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		{
			function children($$renderer, { segments }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(segments);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let segment = each_array[i];

					if (segment.part !== 'dayPeriod') {
						$$renderer.push('<!--[0-->');
						TimeSegment($$renderer, { segment });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			}

			if (TimeField.Input) {
				$$renderer.push('<!--[-->');

				TimeField.Input($$renderer, $.spread_props([
					restProps,
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