import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-wrap gap-2"><!></div>`);

export default function Badge_long_text($$anchor) {
	Example($$anchor, {
		title: 'Long Text',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Badge(node, {
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('A badge with a lot of text to see how it wraps');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}