import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex w-full flex-col gap-7"><div class="flex flex-col gap-3"><!> <!></div> <div class="flex flex-col gap-3"><!> <!></div> <!></div>`);

export default function Skeleton_form($$anchor) {
	Example($$anchor, {
		title: 'Form',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Skeleton(node, { class: 'h-4 w-20' });

			var node_1 = $.sibling(node, 2);

			Skeleton(node_1, { class: 'h-10 w-full' });
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_2 = $.child(div_2);

			Skeleton(node_2, { class: 'h-4 w-24' });

			var node_3 = $.sibling(node_2, 2);

			Skeleton(node_3, { class: 'h-10 w-full' });
			$.reset(div_2);

			var node_4 = $.sibling(div_2, 2);

			Skeleton(node_4, { class: 'h-9 w-24' });
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}