import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from './Test.svelte';

export default function Main($$anchor) {
	Test($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Test');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}