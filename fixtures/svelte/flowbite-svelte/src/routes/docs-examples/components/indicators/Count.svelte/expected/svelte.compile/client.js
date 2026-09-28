import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Indicator, Button } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<span class="text-xs font-bold text-white">8</span>`);
var root_1 = $.from_html(`<!> <span class="sr-only">Notifications</span> Messages <!>`, 1);

export default function Count($$anchor) {
	Button($$anchor, {
		size: 'lg',
		class: 'relative',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			EnvelopeSolid(node, { class: 'me-2 h-6 w-6 text-white dark:text-white' });

			var node_1 = $.sibling(node, 4);

			Indicator(node_1, {
				color: 'red',
				border: true,
				size: 'xl',
				placement: 'top-right',
				children: ($$anchor, $$slotProps) => {
					var span = root();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}