import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Dropdown, DropdownItem, Avatar, Button } from "flowbite-svelte";
import { DotsHorizontalOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex justify-end"><!> <!></div> <div class="flex flex-col items-center pb-4"><!> <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">Bonnie Green</h5> <span class="text-sm text-gray-500 dark:text-gray-400">Visual Designer</span> <div class="mt-4 flex space-x-3 lg:mt-6 rtl:space-x-reverse"><!> <!></div></div>`, 1);

export default function Profile($$anchor) {
	Card($$anchor, {
		class: 'p-4 sm:p-5 md:p-7',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			DotsHorizontalOutline(node, {});

			var node_1 = $.sibling(node, 2);

			Dropdown(node_1, {
				class: 'w-36',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					DropdownItem(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Edit');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					DropdownItem(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Export data');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					DropdownItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Delete');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_5 = $.child(div_1);

			Avatar(node_5, { size: 'lg', src: '/images/profile-picture-3.webp' });

			var div_2 = $.sibling(node_5, 6);
			var node_6 = $.child(div_2);

			Button(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Add friend');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				color: 'light',
				class: 'dark:text-white',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Message');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}