import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { ChevronRight } from '@lucide/svelte';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';

export default function Checkout_button($$renderer, $$props) {
	let {
		onclick,
		disabled = false,
		loading = false,
		text = 'Proceed to Shipping',
		disabledText = '',
		class: className = ''
	} = $$props;

	$$renderer.push(`<div${$.attr_class(`w-full max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:z-[60] ${$.stringify(className)}`)}>`);

	Button($$renderer, {
		class: 'ease-out-expo group w-full bg-primary py-7 text-sm font-bold tracking-[0.2em] uppercase shadow-lg transition-all duration-300 hover:shadow-xl max-sm:h-20 max-sm:rounded-none disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:border-gray-200 disabled:border disabled:opacity-100',
		disabled: disabled || loading,
		onclick,
		children: ($$renderer) => {
			if (loading) {
				$$renderer.push('<!--[0-->');
				LoadingDots($$renderer, {});
			} else {
				$$renderer.push(`<!--[-1--><div class="flex items-center justify-center gap-2"><span>${$.escape(disabled && disabledText ? disabledText : text)}</span> `);

				if (!disabled) {
					$$renderer.push('<!--[0-->');

					ChevronRight($$renderer, {
						class: 'size-4 transition-transform duration-300 group-hover:translate-x-1'
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}