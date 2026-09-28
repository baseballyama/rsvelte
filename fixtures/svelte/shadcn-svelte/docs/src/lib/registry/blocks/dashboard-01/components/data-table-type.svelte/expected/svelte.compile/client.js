import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";

var root = $.from_html(`<div class="w-32"><!></div>`);

export default function Data_table_type($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	Badge(node, {
		variant: 'outline',
		class: 'px-1.5 text-muted-foreground',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.row.original.type));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}