import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Main($$anchor) {
	Child($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('123');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}