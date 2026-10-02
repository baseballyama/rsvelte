import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

export default function At_const01_within_component_input($$anchor) {
	const b = 42;

	Component($$anchor, {
		children: ($$anchor, $$slotProps) => {
			const a = $.derived(() => b * 2);

			$.next();

			var text = $.text();

			text.nodeValue = $.get(a);
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}