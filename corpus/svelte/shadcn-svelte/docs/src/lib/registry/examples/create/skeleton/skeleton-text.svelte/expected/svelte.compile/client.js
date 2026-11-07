import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex w-full flex-col gap-2"><!> <!> <!></div>`);

export default function Skeleton_text($$anchor) {
	Example($$anchor, {
		title: 'Text',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Skeleton(node, { class: 'h-4 w-full' });

			var node_1 = $.sibling(node, 2);

			Skeleton(node_1, { class: 'h-4 w-full' });

			var node_2 = $.sibling(node_1, 2);

			Skeleton(node_2, { class: 'h-4 w-3/4' });
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}