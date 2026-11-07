import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex w-full items-center gap-4"><!> <div class="grid gap-2"><!> <!></div></div>`);

export default function Skeleton_avatar($$anchor) {
	Example($$anchor, {
		title: 'Avatar',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Skeleton(node, { class: 'size-10 shrink-0 rounded-full' });

			var div_1 = $.sibling(node, 2);
			var node_1 = $.child(div_1);

			Skeleton(node_1, { class: 'h-4 w-[150px]' });

			var node_2 = $.sibling(node_1, 2);

			Skeleton(node_2, { class: 'h-4 w-[100px]' });
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}