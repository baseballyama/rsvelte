import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard } from "$lib";

var root = $.from_html(`<span data-testid="child"></span>`);

export default function Basic_clipboard_test($$anchor) {
	Clipboard($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});
}