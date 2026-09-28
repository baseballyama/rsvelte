import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonGroup, Button } from "flowbite-svelte";
import { UserCircleSolid, AdjustmentsVerticalOutline, DownloadSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Profile`, 1);
var root_1 = $.from_html(`<!> Settings`, 1);
var root_2 = $.from_html(`<!> Download`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Icons($$anchor) {
	ButtonGroup($$anchor, {
		class: '*:ring-primary-700!',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			Button(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					UserCircleSolid(node_1, { class: 'me-2 h-4 w-4' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Button(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					AdjustmentsVerticalOutline(node_3, { class: 'me-2 h-4 w-4' });
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Button(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_5 = $.first_child(fragment_4);

					DownloadSolid(node_5, { class: 'me-2 h-4 w-4' });
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}