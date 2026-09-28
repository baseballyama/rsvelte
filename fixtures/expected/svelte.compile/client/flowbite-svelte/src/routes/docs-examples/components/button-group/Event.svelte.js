import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonGroup, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Event($$anchor) {
	const handleClick = () => {
		alert("Clicked");
	};

	ButtonGroup($$anchor, {
		class: '*:ring-primary-700!',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				onclick: handleClick,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Click me');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Settings');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Messages');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}