import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Minus from '@lucide/svelte/icons/minus';
import Plus from '@lucide/svelte/icons/plus';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="border-input ring-offset-background focus-within:border-ring focus-within:ring-ring/30 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg border text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden"><button id="decrement-button" class="border-input bg-background text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground -ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-lg border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Decrease value"><!></button> <input type="text" autocomplete="off" inputmode="numeric" autocorrect="off" aria-roledescription="Number input" spellcheck="false" class="bg-background text-foreground w-full grow px-3 py-2 text-center tabular-nums focus:outline-hidden"/> <button id="increment-button" class="border-input bg-background text-muted-foreground/80 ring-offset-background hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-lg border text-sm transition-shadow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Increase value"><!></button></div></div>`);

export default function Input_28($$anchor) {
	const uid = $.props_id();
	let value = $.state(2048);
	const minValue = 0;

	function increment() {
		$.update(value);
	}

	function decrement() {
		if ($.get(value) > minValue) {
			$.update(value, -1);
		}
	}

	function handleInput(event) {
		const input = event.target;
		const newValue = Number.parseInt(input.value, 10);

		if (!Number.isNaN(newValue) && newValue >= minValue) {
			$.set(value, newValue, true);
		} else {
			input.value = $.get(value).toString();
		}
	}

	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},
		class: 'text-foreground text-sm font-medium',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Number input with plus/minus buttons');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var button = $.child(div_1);
	var node_1 = $.child(button);

	Minus(node_1, { size: 16, 'aria-hidden': 'true' });
	$.reset(button);

	var input_1 = $.sibling(button, 2);

	$.remove_input_defaults(input_1);
	$.set_attribute(input_1, 'min', minValue);

	var button_1 = $.sibling(input_1, 2);
	var node_2 = $.child(button_1);

	Plus(node_2, { size: 16, 'aria-hidden': 'true' });
	$.reset(button_1);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-labelledby', `decrement-button ${uid}`);
		$.set_attribute(button, 'aria-controls', uid);
		button.disabled = $.get(value) <= minValue;
		$.set_attribute(input_1, 'id', uid);
		$.set_attribute(input_1, 'aria-labelledby', uid);
		$.set_attribute(button_1, 'aria-labelledby', `increment-button ${uid}`);
		$.set_attribute(button_1, 'aria-controls', uid);
	});

	$.delegated('click', button, decrement);
	$.delegated('input', input_1, handleInput);
	$.bind_value(input_1, () => $.get(value), ($$value) => $.set(value, $$value));
	$.delegated('click', button_1, increment);
	$.append($$anchor, div);
}

$.delegate(['click', 'input']);