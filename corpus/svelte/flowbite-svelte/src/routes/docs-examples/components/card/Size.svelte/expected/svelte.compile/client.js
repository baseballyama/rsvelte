import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from "flowbite-svelte";

var root = $.from_html(`<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Technology acquisitions</h5> <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions.</p>`, 1);
var root_1 = $.from_html(`<div class="flex justify-center"><!></div>`);

export default function Size($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Card(node, {
		class: 'max-w-[250px] p-6',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();

			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}