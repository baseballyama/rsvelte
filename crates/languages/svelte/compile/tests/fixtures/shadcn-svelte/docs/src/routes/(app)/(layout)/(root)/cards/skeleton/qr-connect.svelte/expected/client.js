import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Qr_connect($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			CardContent(node, {
				class: 'flex justify-center pt-6',
				children: ($$anchor, $$slotProps) => {
					Skeleton($$anchor, { class: 'size-44 rounded-xl' });
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			CardHeader(node_1, {
				class: 'items-center gap-2 text-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_2 = $.first_child(fragment_3);

					Skeleton(node_2, { class: 'h-5 w-56 rounded-md' });

					var node_3 = $.sibling(node_2, 2);

					Skeleton(node_3, { class: 'h-4 w-64 rounded-md' });

					var node_4 = $.sibling(node_3, 2);

					Skeleton(node_4, { class: 'h-4 w-48 rounded-md' });
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}