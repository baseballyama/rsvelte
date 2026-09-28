import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from './Button.svelte';

export default function Main($$anchor) {
	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	Button($$anchor, {
		$$events: { click: increment },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}