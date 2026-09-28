import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

var root = $.from_html(`<!> Syncing`, 1);
var root_1 = $.from_html(`<!> Updating`, 1);
var root_2 = $.from_html(`<!> Processing`, 1);
var root_3 = $.from_html(`<div class="flex items-center gap-4 [--radius:1.2rem]"><!> <!> <!></div>`);

export default function Spinner_badge($$anchor) {
	var div = root_3();
	var node = $.child(div);

	Badge(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Spinner(node_1, {});
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Badge(node_2, {
		variant: 'secondary',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			Spinner(node_3, {});
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Badge(node_4, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_5 = $.first_child(fragment_2);

			Spinner(node_5, {});
			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}