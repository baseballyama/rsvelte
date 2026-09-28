import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progressbar } from "flowbite-svelte";

var root = $.from_html(`<div class="my-4"><div class="mb-1 text-base font-medium dark:text-white">Small</div> <!></div> <div class="my-4"><div class="mb-1 text-base font-medium dark:text-white">Default</div> <!></div> <div class="my-4"><div class="mb-1 text-lg font-medium dark:text-white">Large</div> <!></div> <div class="my-4"><div class="mb-1 text-lg font-medium dark:text-white">Extra Large</div> <!></div>`, 1);

export default function Sizes($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Progressbar(node, { progress: '50', size: 'h-1.5' });
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Progressbar(node_1, { progress: '50', size: 'h-2.5' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.sibling($.child(div_2), 2);

	Progressbar(node_2, { progress: '50', size: 'h-4' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.sibling($.child(div_3), 2);

	Progressbar(node_3, { progress: '50', size: 'h-6' });
	$.reset(div_3);
	$.append($$anchor, fragment);
}