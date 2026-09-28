import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardFooter, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-start gap-3"><!> <div class="flex flex-1 flex-col gap-2"><!> <!></div></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Notification_settings($$anchor) {
	const rows = [0, 1, 2, 3];

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-5 w-32 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-4 w-64 rounded-md' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CardContent(node_3, {
				class: 'flex flex-col gap-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.each(node_4, 16, () => rows, (row) => row, ($$anchor, row) => {
						var div = root_1();
						var node_5 = $.child(div);

						Skeleton(node_5, { class: 'size-4 rounded-sm' });

						var div_1 = $.sibling(node_5, 2);
						var node_6 = $.child(div_1);

						Skeleton(node_6, { class: 'h-4 w-40 rounded-md' });

						var node_7 = $.sibling(node_6, 2);

						Skeleton(node_7, { class: 'h-3 w-56 rounded-md' });
						$.reset(div_1);
						$.reset(div);
						$.append($$anchor, div);
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_3, 2);

			CardFooter(node_8, {
				children: ($$anchor, $$slotProps) => {
					Skeleton($$anchor, { class: 'h-9 w-full rounded-lg' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}