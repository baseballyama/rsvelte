import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Send from '@lucide/svelte/icons/send';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative"><!> <button class="text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Subscribe"><!></button></div></div>`);

export default function Input_19($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with end inline button');

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
		placeholder: 'Email',
		type: 'email'
	});

	var button = $.sibling(node_1, 2);
	var node_2 = $.child(button);

	Send(node_2, { size: 16, 'aria-hidden': 'true' });
	$.reset(button);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}