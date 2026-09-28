import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Indicator } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <span class="sr-only">Notifications</span> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Notification($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		class: 'relative',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			EnvelopeSolid(node_1, { class: 'text-white dark:text-white' });

			var node_2 = $.sibling(node_1, 4);

			Indicator(node_2, {
				color: 'blue',
				border: true,
				size: 'xl',
				placement: 'top-right',
				class: 'text-xs font-bold',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('18');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Button(node_3, {
		class: 'relative',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			EnvelopeSolid(node_4, { class: 'text-white dark:text-white' });

			var node_5 = $.sibling(node_4, 4);

			Indicator(node_5, {
				color: 'red',
				border: true,
				size: 'xl',
				placement: 'top-right',
				class: 'text-xs font-bold',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('20');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Button(node_6, {
		class: 'relative',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_7 = $.first_child(fragment_3);

			EnvelopeSolid(node_7, { class: 'text-white dark:text-white' });

			var node_8 = $.sibling(node_7, 4);

			Indicator(node_8, {
				color: 'gray',
				border: true,
				size: 'xl',
				placement: 'bottom-right',
				class: 'text-xs font-bold',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('20');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}