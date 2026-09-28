import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<div class="flex items-center gap-2"><!> <!> <!> <!> <!></div>`);
var root_1 = $.from_html(`<div class="flex items-center gap-3 rounded-xl bg-muted p-3"><!> <div class="flex flex-1 flex-col gap-2"><!> <!></div> <!></div>`);
var root_2 = $.from_html(`<div class="flex flex-col gap-2"></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Payments($$anchor) {
	const rows = [0, 1, 2];

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'flex flex-col gap-3',
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node_1 = $.child(div);

					Skeleton(node_1, { class: 'h-4 w-12 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'size-1.5 rounded-full' });

					var node_3 = $.sibling(node_2, 2);

					Skeleton(node_3, { class: 'size-7 rounded-md' });

					var node_4 = $.sibling(node_3, 2);

					Skeleton(node_4, { class: 'size-1.5 rounded-full' });

					var node_5 = $.sibling(node_4, 2);

					Skeleton(node_5, { class: 'h-4 w-20 rounded-md' });
					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node, 2);

			CardContent(node_6, {
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_2();

					$.each(div_1, 20, () => rows, (row) => row, ($$anchor, row) => {
						var div_2 = root_1();
						var node_7 = $.child(div_2);

						Skeleton(node_7, { class: 'size-9 rounded-lg bg-muted-foreground/15' });

						var div_3 = $.sibling(node_7, 2);
						var node_8 = $.child(div_3);

						Skeleton(node_8, { class: 'h-4 w-40 rounded-md bg-muted-foreground/15' });

						var node_9 = $.sibling(node_8, 2);

						Skeleton(node_9, { class: 'h-3 w-56 rounded-md bg-muted-foreground/15' });
						$.reset(div_3);

						var node_10 = $.sibling(div_3, 2);

						Skeleton(node_10, { class: 'size-4 rounded-md bg-muted-foreground/15' });
						$.reset(div_2);
						$.append($$anchor, div_2);
					});

					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}