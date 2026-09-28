import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { CurrencyInput } from '$lib/hooks/use-currency-input.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import ChevronUp from '@lucide/svelte/icons/chevron-up';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="border-input ring-offset-background focus-within:border-ring focus-within:ring-ring/30 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg border text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden"><input/> <div class="flex h-[calc(100%+2px)] flex-col"><button><!></button> <button><!></button></div></div></div>`);

export default function Input_29($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const currencyInput = new CurrencyInput({ id: uid, initialValue: 99 });
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return currencyInput.inputProps.id;
		},
		class: 'text-foreground text-sm font-medium',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Number input with chevrons');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var input = $.child(div_1);

	$.attribute_effect(
		input,
		() => ({
			class: 'bg-background text-foreground flex-1 px-3 py-2 tabular-nums focus:outline-hidden',
			...currencyInput.inputProps
		}),
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	var div_2 = $.sibling(input, 2);
	var button = $.child(div_2);

	$.attribute_effect(button, () => ({
		class: 'border-input bg-background text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground -me-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
		...currencyInput.incrementProps
	}));

	var node_1 = $.child(button);

	ChevronUp(node_1, { size: 12, 'aria-hidden': 'true' });
	$.reset(button);

	var button_1 = $.sibling(button, 2);

	$.attribute_effect(button_1, () => ({
		class: 'border-input bg-background text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground -me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
		...currencyInput.decrementProps
	}));

	var node_2 = $.child(button_1);

	ChevronDown(node_2, { size: 12, 'aria-hidden': 'true' });
	$.reset(button_1);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}