import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-3 rounded-xl bg-muted p-4"><div class="flex items-center justify-between"><!> <!></div> <!> <div class="flex items-center justify-between"><!> <!></div> <!> <div class="flex items-center justify-between"><!> <!></div></div>`, 1);

export default function Transfer_funds($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-5 w-36 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-4 w-64 rounded-md' });

					var node_3 = $.sibling(node_2, 2);

					CardAction(node_3, {
						children: ($$anchor, $$slotProps) => {
							Skeleton($$anchor, { class: 'size-8 rounded-md' });
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			CardContent(node_4, {
				class: 'flex flex-col gap-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var div = $.first_child(fragment_4);
					var node_5 = $.child(div);

					Skeleton(node_5, { class: 'h-3 w-32 rounded-md' });

					var node_6 = $.sibling(node_5, 2);

					Skeleton(node_6, { class: 'h-9 w-full rounded-lg' });
					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var node_7 = $.child(div_1);

					Skeleton(node_7, { class: 'h-3 w-24 rounded-md' });

					var node_8 = $.sibling(node_7, 2);

					Skeleton(node_8, { class: 'h-9 w-full rounded-lg' });
					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_9 = $.child(div_2);

					Skeleton(node_9, { class: 'h-3 w-20 rounded-md' });

					var node_10 = $.sibling(node_9, 2);

					Skeleton(node_10, { class: 'h-9 w-full rounded-lg' });
					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var div_4 = $.child(div_3);
					var node_11 = $.child(div_4);

					Skeleton(node_11, { class: 'h-4 w-28 rounded-md bg-muted-foreground/15' });

					var node_12 = $.sibling(node_11, 2);

					Skeleton(node_12, { class: 'h-4 w-24 rounded-md bg-muted-foreground/15' });
					$.reset(div_4);

					var node_13 = $.sibling(div_4, 2);

					Skeleton(node_13, { class: 'h-px w-full rounded-none bg-muted-foreground/15' });

					var div_5 = $.sibling(node_13, 2);
					var node_14 = $.child(div_5);

					Skeleton(node_14, { class: 'h-4 w-28 rounded-md bg-muted-foreground/15' });

					var node_15 = $.sibling(node_14, 2);

					Skeleton(node_15, { class: 'h-4 w-12 rounded-md bg-muted-foreground/15' });
					$.reset(div_5);

					var node_16 = $.sibling(div_5, 2);

					Skeleton(node_16, { class: 'h-px w-full rounded-none bg-muted-foreground/15' });

					var div_6 = $.sibling(node_16, 2);
					var node_17 = $.child(div_6);

					Skeleton(node_17, { class: 'h-4 w-24 rounded-md bg-muted-foreground/15' });

					var node_18 = $.sibling(node_17, 2);

					Skeleton(node_18, { class: 'h-4 w-20 rounded-md bg-muted-foreground/15' });
					$.reset(div_6);
					$.reset(div_3);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_4, 2);

			CardFooter(node_19, {
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