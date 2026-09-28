import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, Avatar } from "flowbite-svelte";

var root = $.from_html(`<span class="font-semibold text-gray-900 dark:text-white">New notification</span> <div class="mt-3 flex items-center"><!> <div class="ms-3"><h4 class="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</h4> <div class="text-sm font-normal">commented on your photo</div> <span class="text-primary-600 dark:text-primary-500 text-xs font-medium">a few seconds ago</span></div></div>`, 1);

export default function Push($$anchor) {
	Toast($$anchor, {
		align: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.sibling($.first_child(fragment_1), 2);
			var node = $.child(div);

			Avatar(node, { src: '/images/profile-picture-3.webp' });
			$.next(2);
			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}