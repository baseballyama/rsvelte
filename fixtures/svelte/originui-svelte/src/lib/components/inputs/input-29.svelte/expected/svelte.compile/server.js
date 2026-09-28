import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { CurrencyInput } from '$lib/hooks/use-currency-input.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronUp from '@lucide/svelte/icons/chevron-up';

export default function Input_29($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		const currencyInput = new CurrencyInput({ id: uid, initialValue: 99 });

		$$renderer.push(`<div class="*:not-first:mt-2">`);

		Label($$renderer, {
			for: currencyInput.inputProps.id,
			class: 'text-foreground text-sm font-medium',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Number input with chevrons`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="border-input ring-offset-background focus-within:border-ring focus-within:ring-ring/30 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg border text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden"><input${$.attributes(
			{
				class: 'bg-background text-foreground flex-1 px-3 py-2 tabular-nums focus:outline-hidden',
				...currencyInput.inputProps
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> <div class="flex h-[calc(100%+2px)] flex-col"><button${$.attributes({
			class: 'border-input bg-background text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground -me-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
			...currencyInput.incrementProps
		})}>`);

		ChevronUp($$renderer, { size: 12, 'aria-hidden': 'true' });

		$$renderer.push(`<!----></button> <button${$.attributes({
			class: 'border-input bg-background text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground -me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
			...currencyInput.decrementProps
		})}>`);

		ChevronDown($$renderer, { size: 12, 'aria-hidden': 'true' });
		$$renderer.push(`<!----></button></div></div></div>`);
	});
}