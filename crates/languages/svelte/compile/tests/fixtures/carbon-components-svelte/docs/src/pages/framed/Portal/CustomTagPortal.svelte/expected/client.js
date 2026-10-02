import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal } from "carbon-components-svelte";

export default function CustomTagPortal($$anchor) {
	Portal($$anchor, {
		tag: 'section',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This portal uses a section tag.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}