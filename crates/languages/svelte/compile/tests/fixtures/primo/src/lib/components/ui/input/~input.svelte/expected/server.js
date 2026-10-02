import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.ts';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<input${$.attributes(
			{
				class: $.clsx(cn('border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', className)),
				value,
				...restProps
			},
			void 0,
			void 0,
			void 0,
			4
		)}/>`);

		$.bind_props($$props, { ref, value });
	});
}