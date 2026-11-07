import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { goto } from '$app/navigation';
import { appendOneTimeCartId, cn } from '$lib/core/utils/index.js';

export default function Checkout_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { step = 1 } = $$props;

		$$renderer.push(`<div class="mb-8"><div class="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-8">`);

		Button($$renderer, {
			variant: 'plain',
			disabled: step === 1 || step === 4,
			onclick: () => goto(appendOneTimeCartId('/checkout/cart')),
			class: cn('flex h-auto items-center p-0 font-normal disabled:opacity-100', step === 1 ? 'text-primary' : 'text-inherit'),
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attr_class($.clsx(cn('flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight', step === 1
					? 'bg-primary border-primary text-primary-foreground'
					: 'border-gray-200')))}>1</div> <span${$.attr_class(`ml-2 text-xs font-bold uppercase tracking-widest ${step === 1 ? '' : 'hidden sm:inline'}`)}>Cart</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="h-px w-4 bg-gray-200 sm:w-8 md:w-16"></div> `);

		Button($$renderer, {
			variant: 'plain',
			disabled: step === 1 || step === 4,
			onclick: () => goto(appendOneTimeCartId('/checkout/address')),
			class: cn('flex h-auto items-center p-0 font-normal hover:bg-transparent disabled:opacity-100', step === 2
				? 'text-primary'
				: step === 1 ? 'text-gray-400 hover:text-gray-900' : 'text-inherit'),

			children: ($$renderer) => {
				$$renderer.push(`<div${$.attr_class($.clsx(cn('flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight', step === 2
					? 'bg-primary border-primary text-primary-foreground'
					: 'border-gray-200')))}>2</div> <span${$.attr_class(`ml-2 text-xs font-bold uppercase tracking-widest ${step === 2 ? '' : 'hidden sm:inline'}`)}>Address</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="h-px w-4 bg-gray-200 sm:w-8 md:w-16"></div> `);

		Button($$renderer, {
			variant: 'plain',
			disabled: true,
			class: cn('flex h-auto items-center p-0 font-normal hover:bg-transparent disabled:opacity-100', step === 3 ? 'text-primary' : 'text-gray-400'),
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attr_class($.clsx(cn('flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight', step === 3
					? 'bg-primary border-primary text-primary-foreground'
					: 'border-gray-200')))}>3</div> <span${$.attr_class(`ml-2 text-xs font-bold uppercase tracking-widest ${step === 3 ? '' : 'hidden sm:inline'}`)}>Payment</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="h-px w-4 bg-gray-200 sm:w-8 md:w-16"></div> `);

		Button($$renderer, {
			variant: 'plain',
			disabled: true,
			class: cn('flex h-auto items-center p-0 font-normal hover:bg-transparent disabled:opacity-100', step === 4 ? 'text-primary' : 'text-gray-400'),
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attr_class($.clsx(cn('flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight', step === 4
					? 'bg-primary border-primary text-primary-foreground'
					: 'border-gray-200')))}>4</div> <span${$.attr_class(`ml-2 text-xs font-bold uppercase tracking-widest ${step === 4 ? '' : 'hidden sm:inline'}`)}>Placed</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	});
}