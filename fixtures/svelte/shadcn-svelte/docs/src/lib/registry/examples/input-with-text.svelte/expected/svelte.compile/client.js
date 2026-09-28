import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<div class="flex w-full max-w-sm flex-col gap-1.5"><!> <!> <p class="text-sm text-muted-foreground">Enter your email address.</p></div>`);

export default function Input_with_text($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		for: 'email-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, { type: 'email', id: 'email-2', placeholder: 'Email' });
	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}