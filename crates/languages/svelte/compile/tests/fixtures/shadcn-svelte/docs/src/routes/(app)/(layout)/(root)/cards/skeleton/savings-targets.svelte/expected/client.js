import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <div class="flex flex-col gap-1.5"><!> <!></div>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-3 rounded-xl bg-muted p-4"><!> <!> <!> <div class="flex items-center justify-between"><!> <!></div></div>`);
var root_2 = $.from_html(`<div class="flex flex-col gap-3"></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Savings_targets($$anchor) {
	const rows = [0, 1];

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-5 w-36 rounded-md' });

					var div = $.sibling(node_1, 2);
					var node_2 = $.child(div);

					Skeleton(node_2, { class: 'h-4 w-full max-w-64 rounded-md' });

					var node_3 = $.sibling(node_2, 2);

					Skeleton(node_3, { class: 'h-4 w-48 rounded-md' });
					$.reset(div);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			CardContent(node_4, {
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_2();

					$.each(div_1, 20, () => rows, (row) => row, ($$anchor, row) => {
						var div_2 = root_1();
						var node_5 = $.child(div_2);

						Skeleton(node_5, { class: 'h-3 w-24 rounded-md bg-muted-foreground/15' });

						var node_6 = $.sibling(node_5, 2);

						Skeleton(node_6, { class: 'h-8 w-36 rounded-md bg-muted-foreground/15' });

						var node_7 = $.sibling(node_6, 2);

						Skeleton(node_7, { class: 'h-2 w-full rounded-full bg-muted-foreground/15' });

						var div_3 = $.sibling(node_7, 2);
						var node_8 = $.child(div_3);

						Skeleton(node_8, { class: 'h-3 w-24 rounded-md bg-muted-foreground/15' });

						var node_9 = $.sibling(node_8, 2);

						Skeleton(node_9, { class: 'h-3 w-20 rounded-md bg-muted-foreground/15' });
						$.reset(div_3);
						$.reset(div_2);
						$.append($$anchor, div_2);
					});

					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_4, 2);

			CardFooter(node_10, {
				class: 'justify-center',
				children: ($$anchor, $$slotProps) => {
					Skeleton($$anchor, { class: 'h-3 w-56 rounded-md' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}