import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from './MyComponent.svelte';

var root = $.from_html(`contents<div></div>`, 1);

export default function Components02_input($$anchor) {
	MyComponent($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}