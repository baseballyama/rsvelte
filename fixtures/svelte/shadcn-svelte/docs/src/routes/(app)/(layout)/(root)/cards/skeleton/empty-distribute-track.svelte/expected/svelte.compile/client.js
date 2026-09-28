import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<div class="flex flex-col items-center gap-4 p-4"><!> <div class="flex flex-col items-center gap-2"><!> <!> <!></div> <!></div>`);

export default function Empty_distribute_track($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node = $.child(div);

					Skeleton(node, { class: 'size-12 rounded-xl' });

					var div_1 = $.sibling(node, 2);
					var node_1 = $.child(div_1);

					Skeleton(node_1, { class: 'h-5 w-40 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-3 w-64 rounded-md' });

					var node_3 = $.sibling(node_2, 2);

					Skeleton(node_3, { class: 'h-3 w-48 rounded-md' });
					$.reset(div_1);

					var node_4 = $.sibling(div_1, 2);

					Skeleton(node_4, { class: 'h-9 w-32 rounded-lg' });
					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}