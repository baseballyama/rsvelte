import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressbar } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function CustomStyle($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Progressbar(node, {
		progress: '50',
		size: 'h-3',
		labelInside: true,
		color: 'green',
		classes: {
			label: "text-xs font-medium text-center p-0 leading-none rounded-full"
		},
		class: 'my-4',
		labelOutside: 'Size h-3'
	});

	var node_1 = $.sibling(node, 2);

	Progressbar(node_1, {
		progress: '50',
		size: 'h-10',
		labelInside: true,
		color: 'red',
		classes: {
			label: "text-2xl font-medium text-center p-2 leading-none rounded-full"
		},
		class: 'my-4',
		labelOutside: 'Size h-10'
	});

	var node_2 = $.sibling(node_1, 2);

	Progressbar(node_2, {
		progress: '50',
		size: 'h-6',
		labelInside: true,
		classes: {
			label: "text-base font-medium text-center p-1 leading-none rounded-full"
		},
		class: 'my-4',
		labelOutside: 'Size h-6'
	});

	$.append($$anchor, fragment);
}