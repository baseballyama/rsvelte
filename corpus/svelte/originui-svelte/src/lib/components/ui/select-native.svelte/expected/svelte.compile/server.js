import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

export default function Select_native($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			value = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div class="relative">`);

		$$renderer.select(
			{
				this: ref,
				value,
				class: cn(
					'peer border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/20 has-[option[disabled]:checked]:text-muted-foreground inline-flex w-full cursor-pointer appearance-none items-center rounded-lg border text-sm shadow-xs shadow-black/5 transition-shadow focus-visible:ring-[3px] focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
					restProps.multiple
						? '[&_option:checked]:bg-accent py-1 *:px-3 *:py-1'
						: 'h-9 ps-3 pe-8',
					className
				),
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

		$$renderer.push(` `);

		if (!restProps.multiple) {
			$$renderer.push(`<!--[0--><span class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center peer-disabled:opacity-50">`);
			ChevronDown($$renderer, { size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref, value });
	});
}