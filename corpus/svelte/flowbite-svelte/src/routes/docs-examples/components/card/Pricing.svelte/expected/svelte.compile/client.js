import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Button } from "flowbite-svelte";
import { CheckCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<h5 class="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">Standard plan</h5> <div class="flex items-baseline text-gray-900 dark:text-white"><span class="text-3xl font-semibold">$</span> <span class="text-5xl font-extrabold tracking-tight">49</span> <span class="ms-1 text-xl font-normal text-gray-500 dark:text-gray-400">/month</span></div> <ul class="my-7 space-y-4"><li class="flex space-x-2 rtl:space-x-reverse"><!> <span class="text-base leading-tight font-normal text-gray-500 dark:text-gray-400">2 team members</span></li> <li class="flex space-x-2 rtl:space-x-reverse"><!> <span class="text-base leading-tight font-normal text-gray-500 dark:text-gray-400">20GB Cloud storage</span></li> <li class="flex space-x-2 rtl:space-x-reverse"><!> <span class="text-base leading-tight font-normal text-gray-500 dark:text-gray-400">Integration help</span></li> <li class="flex space-x-2 line-through decoration-gray-500 rtl:space-x-reverse"><!> <span class="text-base leading-tight font-normal text-gray-500">Sketch Files</span></li> <li class="flex space-x-2 line-through decoration-gray-500 rtl:space-x-reverse"><!> <span class="text-base leading-tight font-normal text-gray-500">API Access</span></li> <li class="flex space-x-2 line-through decoration-gray-500 rtl:space-x-reverse"><!> <span class="text-base leading-tight font-normal text-gray-500">Complete documentation</span></li> <li class="flex space-x-2 line-through decoration-gray-500 rtl:space-x-reverse"><!> <span class="text-base leading-tight font-normal text-gray-500">24×7 phone & email support</span></li></ul> <!>`, 1);

export default function Pricing($$anchor) {
	Card($$anchor, {
		class: 'p-4 sm:p-8 md:p-10',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var ul = $.sibling($.first_child(fragment_1), 4);
			var li = $.child(ul);
			var node = $.child(li);

			CheckCircleSolid(node, { class: 'text-primary-600 dark:text-primary-500 h-4 w-4' });
			$.next(2);
			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var node_1 = $.child(li_1);

			CheckCircleSolid(node_1, { class: 'text-primary-600 dark:text-primary-500 h-4 w-4' });
			$.next(2);
			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var node_2 = $.child(li_2);

			CheckCircleSolid(node_2, { class: 'text-primary-600 dark:text-primary-500 h-4 w-4' });
			$.next(2);
			$.reset(li_2);

			var li_3 = $.sibling(li_2, 2);
			var node_3 = $.child(li_3);

			CheckCircleSolid(node_3, { class: 'h-4 w-4 text-gray-400 dark:text-gray-500' });
			$.next(2);
			$.reset(li_3);

			var li_4 = $.sibling(li_3, 2);
			var node_4 = $.child(li_4);

			CheckCircleSolid(node_4, { class: 'h-4 w-4 text-gray-400 dark:text-gray-500' });
			$.next(2);
			$.reset(li_4);

			var li_5 = $.sibling(li_4, 2);
			var node_5 = $.child(li_5);

			CheckCircleSolid(node_5, { class: 'h-4 w-4 text-gray-400 dark:text-gray-500' });
			$.next(2);
			$.reset(li_5);

			var li_6 = $.sibling(li_5, 2);
			var node_6 = $.child(li_6);

			CheckCircleSolid(node_6, { class: 'h-4 w-4 text-gray-400 dark:text-gray-500' });
			$.next(2);
			$.reset(li_6);
			$.reset(ul);

			var node_7 = $.sibling(ul, 2);

			Button(node_7, {
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Choose plan');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}