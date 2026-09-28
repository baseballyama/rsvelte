import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Listgroup, ListgroupItem, Avatar } from "flowbite-svelte";
import { TrashBinSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!>Jese Leos`, 1);
var root_1 = $.from_html(`<!>Robert Gouth`, 1);
var root_2 = $.from_html(`<!>Bonnie Green`, 1);
var root_3 = $.from_html(`<h3 class="p-1 text-center text-xl font-medium text-gray-900 dark:text-white">User list</h3> <!> <!> <!> <a href="/" class="flex items-center rounded-b-lg bg-gray-50 p-3 text-sm font-medium text-red-600 hover:bg-gray-100 hover:underline dark:bg-gray-700 dark:text-red-500 dark:hover:bg-gray-600"><!> Delete user</a>`, 1);

export default function Advanced($$anchor) {
	Listgroup($$anchor, {
		active: true,
		class: 'w-48',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.sibling($.first_child(fragment_1), 2);

			ListgroupItem(node, {
				class: 'gap-2 text-base font-semibold',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Avatar(node_1, { src: '/images/profile-picture-1.webp', size: 'xs' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			ListgroupItem(node_2, {
				class: 'gap-2 text-base font-semibold',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					Avatar(node_3, { src: '/images/profile-picture-2.webp', size: 'xs' });
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			ListgroupItem(node_4, {
				class: 'gap-2 text-base font-semibold',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_5 = $.first_child(fragment_4);

					Avatar(node_5, { src: '/images/profile-picture-3.webp', size: 'xs' });
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var a = $.sibling(node_4, 2);
			var node_6 = $.child(a);

			TrashBinSolid(node_6, { class: 'ms-1 me-2 h-6 w-6' });
			$.next();
			$.reset(a);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}