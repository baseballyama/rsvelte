import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="flex flex-col gap-2"><!> <!> <!></div> <div class="flex gap-2"><!> <!></div>`, 1);

export default function Loading_card($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							Skeleton(node_2, { class: 'h-5 w-32' });

							var node_3 = $.sibling(node_2, 2);

							Skeleton(node_3, { class: 'h-4 w-48' });
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_5 = $.first_child(fragment_3);

							Skeleton(node_5, { class: 'h-32 w-full rounded-lg' });

							var div = $.sibling(node_5, 2);
							var node_6 = $.child(div);

							Skeleton(node_6, { class: 'h-4 w-full' });

							var node_7 = $.sibling(node_6, 2);

							Skeleton(node_7, { class: 'h-4 w-3/4' });

							var node_8 = $.sibling(node_7, 2);

							Skeleton(node_8, { class: 'h-4 w-1/2' });
							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var node_9 = $.child(div_1);

							Skeleton(node_9, { class: 'h-9 flex-1 rounded-md' });

							var node_10 = $.sibling(node_9, 2);

							Skeleton(node_10, { class: 'h-9 flex-1 rounded-md' });
							$.reset(div_1);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}