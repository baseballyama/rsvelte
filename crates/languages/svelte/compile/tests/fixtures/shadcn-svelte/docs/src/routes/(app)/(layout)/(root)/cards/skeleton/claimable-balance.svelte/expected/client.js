import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-3 rounded-xl bg-muted p-4"><div class="flex items-center justify-between"><!> <!></div> <div class="flex items-center justify-between"><!> <!></div> <!> <div class="flex items-center justify-between"><!> <!></div></div>`);

export default function Claimable_balance($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-4 w-36 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-12 w-56 rounded-lg' });

					var node_3 = $.sibling(node_2, 2);

					Skeleton(node_3, { class: 'h-6 w-32 rounded-full' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			CardContent(node_4, {
				class: 'flex flex-1 flex-col justify-end',
				children: ($$anchor, $$slotProps) => {
					var div = root_1();
					var div_1 = $.child(div);
					var node_5 = $.child(div_1);

					Skeleton(node_5, { class: 'h-4 w-28 rounded-md bg-muted-foreground/15' });

					var node_6 = $.sibling(node_5, 2);

					Skeleton(node_6, { class: 'h-4 w-20 rounded-md bg-muted-foreground/15' });
					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_7 = $.child(div_2);

					Skeleton(node_7, { class: 'h-4 w-32 rounded-md bg-muted-foreground/15' });

					var node_8 = $.sibling(node_7, 2);

					Skeleton(node_8, { class: 'h-4 w-16 rounded-md bg-muted-foreground/15' });
					$.reset(div_2);

					var node_9 = $.sibling(div_2, 2);

					Skeleton(node_9, { class: 'h-px w-full rounded-none bg-muted-foreground/15' });

					var div_3 = $.sibling(node_9, 2);
					var node_10 = $.child(div_3);

					Skeleton(node_10, { class: 'h-4 w-36 rounded-md bg-muted-foreground/15' });

					var node_11 = $.sibling(node_10, 2);

					Skeleton(node_11, { class: 'h-4 w-24 rounded-md bg-muted-foreground/15' });
					$.reset(div_3);
					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_4, 2);

			CardFooter(node_12, {
				class: 'flex-col gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_13 = $.first_child(fragment_3);

					Skeleton(node_13, { class: 'h-3 w-full rounded-md' });

					var node_14 = $.sibling(node_13, 2);

					Skeleton(node_14, { class: 'h-3 w-11/12 rounded-md' });

					var node_15 = $.sibling(node_14, 2);

					Skeleton(node_15, { class: 'h-3 w-3/4 rounded-md' });
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}