import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressbar } from "flowbite-svelte";

var root = $.from_html(`<div class="my-4"><div class="mb-1 text-base font-medium dark:text-white">Gray</div> <!></div> <div class="my-4"><div class="mb-1 text-base font-medium text-blue-700 dark:text-blue-500">Blue</div> <!></div> <div class="my-4"><div class="mb-1 text-base font-medium text-red-700 dark:text-red-500">Red</div> <!></div> <div class="my-4"><div class="mb-1 text-base font-medium text-green-700 dark:text-green-500">Green</div> <!></div> <div class="mb-1 text-base font-medium text-yellow-700 dark:text-yellow-500">Yellow</div> <div class="my-4"><!></div> <div class="mb-1 text-base font-medium text-indigo-700 dark:text-indigo-400">Indigo</div> <div class="my-4"><!></div> <div class="mb-1 text-base font-medium text-purple-700 dark:text-purple-400">Purple</div> <div class="my-4"><!></div>`, 1);

export default function Colors($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Progressbar(node, { progress: '50', color: 'gray' });
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Progressbar(node_1, { progress: '50', color: 'blue' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.sibling($.child(div_2), 2);

	Progressbar(node_2, { progress: '50', color: 'red' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.sibling($.child(div_3), 2);

	Progressbar(node_3, { progress: '50', color: 'green' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 4);
	var node_4 = $.child(div_4);

	Progressbar(node_4, { progress: '50', color: 'yellow' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 4);
	var node_5 = $.child(div_5);

	Progressbar(node_5, { progress: '50', color: 'indigo' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 4);
	var node_6 = $.child(div_6);

	Progressbar(node_6, { progress: '50', color: 'purple' });
	$.reset(div_6);
	$.append($$anchor, fragment);
}