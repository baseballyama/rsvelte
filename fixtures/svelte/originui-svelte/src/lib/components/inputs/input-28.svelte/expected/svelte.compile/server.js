import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Minus from '@lucide/svelte/icons/minus';
import Plus from '@lucide/svelte/icons/plus';

export default function Input_28($$renderer) {
	const uid = $.props_id($$renderer);
	let value = 2048;
	const minValue = 0;

	function increment() {
		value++;
	}

	function decrement() {
		if (value > minValue) {
			value--;
		}
	}

	function handleInput(event) {
		const input = event.target;
		const newValue = Number.parseInt(input.value, 10);

		if (!Number.isNaN(newValue) && newValue >= minValue) {
			value = newValue;
		} else {
			input.value = value.toString();
		}
	}

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		class: 'text-foreground text-sm font-medium',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Number input with plus/minus buttons`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="border-input ring-offset-background focus-within:border-ring focus-within:ring-ring/30 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg border text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden"><button id="decrement-button" class="border-input bg-background text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground -ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-lg border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Decrease value"${$.attr('aria-labelledby', `decrement-button ${uid}`)}${$.attr('aria-controls', uid)}${$.attr('disabled', value <= minValue, true)}>`);
	Minus($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></button> <input${$.attr('id', uid)} type="text"${$.attr('value', value)}${$.attr('aria-labelledby', uid)} autocomplete="off" inputmode="numeric" autocorrect="off" aria-roledescription="Number input" spellcheck="false"${$.attr('min', minValue)} class="bg-background text-foreground w-full grow px-3 py-2 text-center tabular-nums focus:outline-hidden"/> <button id="increment-button" class="border-input bg-background text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-lg border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Increase value"${$.attr('aria-labelledby', `increment-button ${uid}`)}${$.attr('aria-controls', uid)}>`);
	Plus($$renderer, { size: 16, 'aria-hidden': 'true' });
	$$renderer.push(`<!----></button></div></div>`);
}