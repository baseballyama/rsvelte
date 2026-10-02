import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ItalicIcon from "@lucide/svelte/icons/italic";
import { Toggle } from "$lib/registry/ui/toggle/index.js";

var root = $.from_html(`<!> Italic`, 1);

export default function Toggle_with_text($$anchor) {
	Toggle($$anchor, {
		'aria-label': 'Toggle italic',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ItalicIcon(node, { class: 'me-2 size-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}