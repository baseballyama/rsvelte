import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<div class="flex items-center gap-3"><!> <div class="flex flex-1 flex-col gap-2"><!> <!></div></div> <div class="flex flex-col gap-2"><!> <!> <!></div> <div class="flex gap-2"><!> <!></div>`, 1);

export default function Skeleton_loading($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var div = $.first_child(fragment_2);
							var node_2 = $.child(div);

							Skeleton(node_2, { class: 'size-10 rounded-full' });

							var div_1 = $.sibling(node_2, 2);
							var node_3 = $.child(div_1);

							Skeleton(node_3, { class: 'h-4 w-3/4' });

							var node_4 = $.sibling(node_3, 2);

							Skeleton(node_4, { class: 'h-3 w-1/2' });
							$.reset(div_1);
							$.reset(div);

							var div_2 = $.sibling(div, 2);
							var node_5 = $.child(div_2);

							Skeleton(node_5, { class: 'h-3 w-full' });

							var node_6 = $.sibling(node_5, 2);

							Skeleton(node_6, { class: 'h-3 w-full' });

							var node_7 = $.sibling(node_6, 2);

							Skeleton(node_7, { class: 'h-3 w-4/5' });
							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var node_8 = $.child(div_3);

							Skeleton(node_8, { class: 'h-8 w-20' });

							var node_9 = $.sibling(node_8, 2);

							Skeleton(node_9, { class: 'h-8 w-20' });
							$.reset(div_3);
							$.append($$anchor, fragment_2);
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