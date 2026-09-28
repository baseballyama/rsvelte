import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <div class="flex flex-wrap gap-2"><!> <!> <!></div> <div class="flex flex-col gap-3"><!> <!></div> <div class="flex items-center gap-2"><div class="flex gap-2"><!> <!> <!></div> <div class="ml-auto flex gap-3"><!> <!></div> <div class="flex gap-3"><!> <!></div> <!></div> <div class="flex items-center gap-4"><!> <div class="flex"><!> <!></div> <!></div>`, 1);

export default function Ui_elements($$anchor) {
	Card($$anchor, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				class: 'flex flex-col gap-6',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Skeleton(node, { class: 'h-8 w-full rounded-2xl' });

					var div = $.sibling(node, 2);
					var node_1 = $.child(div);

					Skeleton(node_1, { class: 'h-9 w-20 rounded-lg' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-9 w-24 rounded-lg' });

					var node_3 = $.sibling(node_2, 2);

					Skeleton(node_3, { class: 'h-9 w-20 rounded-lg' });
					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var node_4 = $.child(div_1);

					Skeleton(node_4, { class: 'h-9 w-full rounded-lg' });

					var node_5 = $.sibling(node_4, 2);

					Skeleton(node_5, { class: 'h-20 w-full rounded-lg' });
					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var div_3 = $.child(div_2);
					var node_6 = $.child(div_3);

					Skeleton(node_6, { class: 'h-5 w-12 rounded-full' });

					var node_7 = $.sibling(node_6, 2);

					Skeleton(node_7, { class: 'h-5 w-16 rounded-full' });

					var node_8 = $.sibling(node_7, 2);

					Skeleton(node_8, { class: 'hidden h-5 w-14 rounded-full 4xl:block' });
					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var node_9 = $.child(div_4);

					Skeleton(node_9, { class: 'size-4 rounded-full' });

					var node_10 = $.sibling(node_9, 2);

					Skeleton(node_10, { class: 'size-4 rounded-full' });
					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var node_11 = $.child(div_5);

					Skeleton(node_11, { class: 'size-4 rounded-sm' });

					var node_12 = $.sibling(node_11, 2);

					Skeleton(node_12, { class: 'hidden size-4 rounded-sm 4xl:block' });
					$.reset(div_5);

					var node_13 = $.sibling(div_5, 2);

					Skeleton(node_13, { class: 'ml-auto h-5 w-9 rounded-full 4xl:hidden' });
					$.reset(div_2);

					var div_6 = $.sibling(div_2, 2);
					var node_14 = $.child(div_6);

					Skeleton(node_14, { class: 'h-9 w-24 rounded-lg' });

					var div_7 = $.sibling(node_14, 2);
					var node_15 = $.child(div_7);

					Skeleton(node_15, { class: 'h-9 w-28 rounded-l-lg rounded-r-none' });

					var node_16 = $.sibling(node_15, 2);

					Skeleton(node_16, { class: 'ml-px h-9 w-9 rounded-l-none rounded-r-lg' });
					$.reset(div_7);

					var node_17 = $.sibling(div_7, 2);

					Skeleton(node_17, { class: 'ml-auto hidden h-5 w-9 rounded-full 4xl:block' });
					$.reset(div_6);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}