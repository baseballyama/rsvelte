import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Forward from './Forward.svelte';

var root = $.from_html(`<span>lol</span>`);

export default function Main($$anchor) {
	Forward($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});
}