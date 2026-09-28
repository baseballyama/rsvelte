import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardAction, CardHeader } from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Analytics_card($$anchor) {
	Card($$anchor, {
		class: 'mx-auto w-full max-w-sm data-[size=sm]:pb-0',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'gap-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Skeleton(node_1, { class: 'h-5 w-24 rounded-md' });

					var node_2 = $.sibling(node_1, 2);

					Skeleton(node_2, { class: 'h-4 w-40 rounded-md' });

					var node_3 = $.sibling(node_2, 2);

					CardAction(node_3, {
						children: ($$anchor, $$slotProps) => {
							Skeleton($$anchor, { class: 'h-7 w-28 rounded-lg' });
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			Skeleton(node_4, { class: 'mx-6 mb-6 aspect-[1/0.35] w-auto rounded-lg' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}