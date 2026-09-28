import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "flowbite-svelte";
import { CloseCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<button type="button" class="bg-primary-500 dark:bg-primary-400 dark:text-primary-800 hover:bg-primary-900 my-0.5 ms-1.5 -me-1.5 inline-flex items-center rounded-full p-0.5 text-sm text-white hover:text-white dark:hover:bg-red-900 dark:hover:text-yellow-300" aria-label="Remove"><!> <span class="sr-only">Remove badge</span></button>`);

export default function Dismissable2($$anchor) {
	{
		const icon = ($$anchor) => {
			var button = root();
			var node = $.child(button);

			CloseCircleSolid(node, { class: 'h-4 w-4' });
			$.next(2);
			$.reset(button);
			$.append($$anchor, button);
		};

		Badge($$anchor, {
			dismissable: true,
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Default');

				$.append($$anchor, text);
			},
			$$slots: { icon: true, default: true }
		});
	}
}