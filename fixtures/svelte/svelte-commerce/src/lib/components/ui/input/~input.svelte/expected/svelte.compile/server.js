import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

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
				class: $.clsx(cn('flex h-9 w-full rounded-radius border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm md:file:text-sm', className)),
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