import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "flowbite-svelte";

var root = $.from_html(`I agree with the <a href="/" class="text-primary-600 dark:text-primary-500 ms-1 hover:underline">terms and conditions</a> .`, 1);

export default function Link($$anchor) {
	Checkbox($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}