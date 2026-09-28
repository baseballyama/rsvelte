import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Slot from './slot.svelte';

var root = $.from_html(`<p>bar</p>`);

export default function Main($$anchor) {
	Slot($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});
}