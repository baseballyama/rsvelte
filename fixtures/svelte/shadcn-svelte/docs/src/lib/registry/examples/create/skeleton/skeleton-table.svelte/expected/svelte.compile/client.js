import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex w-full flex-col gap-2"><div class="flex gap-4"><!> <!> <!></div> <div class="flex gap-4"><!> <!> <!></div> <div class="flex gap-4"><!> <!> <!></div></div>`);

export default function Skeleton_table($$anchor) {
	Example($$anchor, {
		title: 'Table',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Skeleton(node, { class: 'h-4 flex-1' });

			var node_1 = $.sibling(node, 2);

			Skeleton(node_1, { class: 'h-4 w-24' });

			var node_2 = $.sibling(node_1, 2);

			Skeleton(node_2, { class: 'h-4 w-20' });
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_3 = $.child(div_2);

			Skeleton(node_3, { class: 'h-4 flex-1' });

			var node_4 = $.sibling(node_3, 2);

			Skeleton(node_4, { class: 'h-4 w-24' });

			var node_5 = $.sibling(node_4, 2);

			Skeleton(node_5, { class: 'h-4 w-20' });
			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_6 = $.child(div_3);

			Skeleton(node_6, { class: 'h-4 flex-1' });

			var node_7 = $.sibling(node_6, 2);

			Skeleton(node_7, { class: 'h-4 w-24' });

			var node_8 = $.sibling(node_7, 2);

			Skeleton(node_8, { class: 'h-4 w-20' });
			$.reset(div_3);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}