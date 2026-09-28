import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UnrenderedChildren from './unrendered-children.svelte';

export default function Main($$anchor) {
	UnrenderedChildren($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Hi');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}