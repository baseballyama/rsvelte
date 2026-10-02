import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './inner.svelte';

export default function Main($$anchor) {
	Inner($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('I don\'t need to use the argument if I don\'t want to');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}