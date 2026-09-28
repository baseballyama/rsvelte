import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<div class="flex flex-wrap items-center gap-2 md:flex-row"><!> <!></div>`);

export default function Button_demo($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Submit',
		children: ($$anchor, $$slotProps) => {
			ArrowUpIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}