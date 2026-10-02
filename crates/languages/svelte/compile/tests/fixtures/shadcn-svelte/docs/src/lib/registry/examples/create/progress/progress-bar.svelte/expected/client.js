import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from "$lib/registry/ui/progress/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex w-full flex-col gap-4"><!> <!> <!> <!> <!></div>`);

export default function Progress_bar($$anchor) {
	Example($$anchor, {
		title: 'Progress Bar',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Progress(node, { value: 0 });

			var node_1 = $.sibling(node, 2);

			Progress(node_1, { value: 25, class: 'w-full' });

			var node_2 = $.sibling(node_1, 2);

			Progress(node_2, { value: 50 });

			var node_3 = $.sibling(node_2, 2);

			Progress(node_3, { value: 75 });

			var node_4 = $.sibling(node_3, 2);

			Progress(node_4, { value: 100 });
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}