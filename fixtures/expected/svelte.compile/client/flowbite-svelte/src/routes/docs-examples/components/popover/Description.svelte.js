import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from "flowbite-svelte";
import { QuestionCircleSolid, ChevronRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="space-y-2 p-3"><h3 class="font-semibold text-gray-900 dark:text-white">Activity growth - Incremental</h3> Report helps navigate cumulative growth of community activities. Ideally, the chart should have a growing trend. <span class="font-semibold text-gray-900 dark:text-white">Calculation</span> For each date bucket, the all-time volume of activities is calculated. This means that activities in period n contain all activities up to period n. <a href="/" class="text-primary-600 dark:text-primary-500 dark:hover:text-primary-600 hover:text-primary-700 flex items-center font-medium">Read more <!></a></div>`);
var root_1 = $.from_html(`<div class="flex items-center text-sm font-light text-gray-500 dark:text-gray-400">This is just some informational text <button id="b3"><!> <span class="sr-only">Show information</span></button></div> <!>`, 1);

export default function Description($$anchor) {
	var fragment = root_1();
	var div = $.first_child(fragment);
	var button = $.sibling($.child(div));
	var node = $.child(button);

	QuestionCircleSolid(node, { class: 'ms-1.5 h-5 w-5' });
	$.next(2);
	$.reset(button);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Popover(node_1, {
		triggeredBy: '#b3',
		class: 'w-72 bg-white text-sm font-light text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400',
		placement: 'bottom-start',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var a = $.sibling($.child(div_1), 4);
			var node_2 = $.sibling($.child(a));

			ChevronRightOutline(node_2, {
				class: 'text-primary-600 dark:text-primary-500 ms-1.5 h-4 w-4'
			});

			$.reset(a);
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}