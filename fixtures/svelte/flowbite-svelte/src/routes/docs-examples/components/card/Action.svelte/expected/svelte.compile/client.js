import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Button } from "flowbite-svelte";

var root = $.from_html(`<h5 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Work fast from anywhere</h5> <p class="mb-5 text-base text-gray-500 sm:text-lg dark:text-gray-400">Stay up to date and move work forward with Flowbite on iOS & Android. Download the app today.</p> <div class="items-center justify-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4 rtl:space-x-reverse"><!> <!></div>`, 1);

export default function Action($$anchor) {
	Card($$anchor, {
		size: 'lg',
		class: 'p-4 text-center sm:p-8 md:p-10',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.sibling($.first_child(fragment_1), 4);
			var node = $.child(div);

			Button(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Download it');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Get it on');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}