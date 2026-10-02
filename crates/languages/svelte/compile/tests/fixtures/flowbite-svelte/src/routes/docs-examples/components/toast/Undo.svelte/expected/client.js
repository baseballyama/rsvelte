import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";

var root = $.from_html(`Conversation archived. <a class="text-primary-600 hover:bg-primary-100 dark:text-primary-500 ms-auto rounded-lg p-1.5 font-medium dark:hover:bg-gray-700" href="/">Undo</a>`, 1);

export default function Undo($$anchor) {
	Toast($$anchor, {
		classes: {
			content: "w-full text-sm font-normal flex items-center justify-between"
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}