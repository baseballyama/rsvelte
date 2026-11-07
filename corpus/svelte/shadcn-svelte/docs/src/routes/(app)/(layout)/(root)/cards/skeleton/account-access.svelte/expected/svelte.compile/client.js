import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><div class="flex items-center justify-between"><!> <!></div> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Account_access($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-5 w-36 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-4 w-64 rounded-md' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CardContent(node_3, {
				class: 'flex flex-col gap-6',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var div = $.first_child(fragment_3);
					var node_4 = $.child(div);

					Skeleton(node_4, { class: 'h-3 w-24 rounded-md' });

					var node_5 = $.sibling(node_4, 2);

					Skeleton(node_5, { class: 'h-9 w-full rounded-lg' });
					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var div_2 = $.child(div_1);
					var node_6 = $.child(div_2);

					Skeleton(node_6, { class: 'h-3 w-32 rounded-md' });

					var node_7 = $.sibling(node_6, 2);

					Skeleton(node_7, { class: 'h-3 w-12 rounded-md' });
					$.reset(div_2);

					var node_8 = $.sibling(div_2, 2);

					Skeleton(node_8, { class: 'h-9 w-full rounded-lg' });
					$.reset(div_1);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_3, 2);

			CardFooter(node_9, {
				class: 'flex-col gap-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_10 = $.first_child(fragment_4);

					Skeleton(node_10, { class: 'h-9 w-full rounded-lg' });

					var node_11 = $.sibling(node_10, 2);

					Skeleton(node_11, { class: 'h-14 w-full rounded-xl' });
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}