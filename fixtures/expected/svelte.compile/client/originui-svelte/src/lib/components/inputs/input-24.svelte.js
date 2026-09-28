import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import CircleX from '@lucide/svelte/icons/circle-x';

var root = $.from_html(`<button class="text-muted-foreground/80 ring-offset-background animate-in fade-in zoom-in-75 hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Clear input"><!></button>`);
var root_1 = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative"><!> <!></div></div>`);

export default function Input_24($$anchor) {
	const uid = $.props_id();
	let inputValue = $.state('Click to clear');
	let inputElement = $.state(null);

	function handleClearInput() {
		$.set(inputValue, '');
	}

	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with clear button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Input(node_1, {
		get id() {
			return uid;
		},
		class: 'pe-9',
		placeholder: 'Type something...',
		type: 'text',
		get ref() {
			return $.get(inputElement);
		},

		set ref($$value) {
			$.set(inputElement, $$value, true);
		},

		get value() {
			return $.get(inputValue);
		},

		set value($$value) {
			$.set(inputValue, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var node_3 = $.child(button);

			CircleX(node_3, { size: 16, 'aria-hidden': 'true' });
			$.reset(button);
			$.delegated('click', button, handleClearInput);
			$.append($$anchor, button);
		};

		$.if(node_2, ($$render) => {
			if ($.get(inputValue)) $$render(consequent);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}

$.delegate(['click']);