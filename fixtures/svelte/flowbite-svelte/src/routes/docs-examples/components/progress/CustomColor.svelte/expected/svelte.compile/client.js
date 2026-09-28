import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressbar } from "flowbite-svelte";

var root = $.from_html(`<div class="space-y-4"><!> <!> <!></div>`);

export default function CustomColor($$anchor) {
	var div = root();
	var node = $.child(div);

	Progressbar(node, {
		progress: '40',
		classes: { label: "bg-sky-600 dark:bg-sky-400" }
	});

	var node_1 = $.sibling(node, 2);

	Progressbar(node_1, {
		progress: '40',
		classes: { label: "bg-lime-600 dark:bg-lime-400" }
	});

	var node_2 = $.sibling(node_1, 2);

	Progressbar(node_2, {
		progress: '40',
		classes: { label: "bg-pink-600 dark:bg-pink-400" }
	});

	$.reset(div);
	$.append($$anchor, div);
}