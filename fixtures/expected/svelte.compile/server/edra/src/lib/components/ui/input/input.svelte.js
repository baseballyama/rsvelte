import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			type,
			files = void 0,
			class: className,
			'data-slot': dataSlot = 'input',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (type === 'file') {
			$$renderer.push(`<!--[0--><input${$.attributes(
				{
					'data-slot': dataSlot,
					class: $.clsx(cn('h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40', className)),
					type: 'file',
					...restProps
				},
				void 0,
				void 0,
				void 0,
				4
			)}/>`);
		} else {
			$$renderer.push(`<!--[-1--><input${$.attributes(
				{
					'data-slot': dataSlot,
					class: $.clsx(cn('h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40', className)),
					type,
					value,
					...restProps
				},
				void 0,
				void 0,
				void 0,
				4
			)}/>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, value, files });
	});
}