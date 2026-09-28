import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

var root = $.from_html(`<input/>`);

export default function Input($$anchor) {
	Widget($$anchor, {
		scope: 'foo',
		children: ($$anchor, $$slotProps) => {
			var input = root();

			$.autofocus(input, true);
			$.append($$anchor, input);
		},
		$$slots: { default: true }
	});
}