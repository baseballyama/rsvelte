import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Main($$anchor) {
	let text = 'dont fuse this text with the one from the child';

	Child($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			text_1.nodeValue = 'dont fuse this text with the one from the child';
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});
}