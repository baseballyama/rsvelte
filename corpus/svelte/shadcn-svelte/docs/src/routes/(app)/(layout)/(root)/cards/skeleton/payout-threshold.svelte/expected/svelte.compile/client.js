import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-3"><div class="flex items-baseline justify-between"><!> <!></div> <!> <div class="flex items-center justify-between"><!> <!></div></div> <div class="flex flex-col gap-2"><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Payout_threshold($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-5 w-44 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-4 w-72 rounded-md' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CardContent(node_3, {
				class: 'flex flex-col gap-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var div = $.first_child(fragment_3);
					var node_4 = $.child(div);

					Skeleton(node_4, { class: 'h-3 w-32 rounded-md' });

					var node_5 = $.sibling(node_4, 2);

					Skeleton(node_5, { class: 'h-9 w-full rounded-lg' });
					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var div_2 = $.child(div_1);
					var node_6 = $.child(div_2);

					Skeleton(node_6, { class: 'h-3 w-40 rounded-md' });

					var node_7 = $.sibling(node_6, 2);

					Skeleton(node_7, { class: 'h-7 w-24 rounded-md' });
					$.reset(div_2);

					var node_8 = $.sibling(div_2, 2);

					Skeleton(node_8, { class: 'h-2 w-full rounded-full' });

					var div_3 = $.sibling(node_8, 2);
					var node_9 = $.child(div_3);

					Skeleton(node_9, { class: 'h-3 w-16 rounded-md' });

					var node_10 = $.sibling(node_9, 2);

					Skeleton(node_10, { class: 'h-3 w-20 rounded-md' });
					$.reset(div_3);
					$.reset(div_1);

					var div_4 = $.sibling(div_1, 2);
					var node_11 = $.child(div_4);

					Skeleton(node_11, { class: 'h-3 w-16 rounded-md' });

					var node_12 = $.sibling(node_11, 2);

					Skeleton(node_12, { class: 'h-[100px] w-full rounded-lg' });
					$.reset(div_4);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_3, 2);

			CardFooter(node_13, {
				children: ($$anchor, $$slotProps) => {
					Skeleton($$anchor, { class: 'h-9 w-full rounded-lg' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}