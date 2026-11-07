import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex items-center gap-6"><!> <!></div>`);

export default function Spinner_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Spinner(node, {});

			var node_1 = $.sibling(node, 2);

			Spinner(node_1, { class: 'size-6' });
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}