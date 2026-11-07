import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Plus from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-start gap-8"><!> <!> <!></div>`);

export default function Button_group_size_demo($$anchor) {
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				Button(node_1, {
					variant: 'outline',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Small');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Button(node_2, {
					variant: 'outline',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Button');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				Button(node_3, {
					variant: 'outline',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Group');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				Button(node_4, {
					variant: 'outline',
					size: 'icon-sm',
					children: ($$anchor, $$slotProps) => {
						Plus($$anchor, {});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node, 2);

	$.component(node_5, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_1) => {
		ButtonGroup_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_6 = $.first_child(fragment_2);

				Button(node_6, {
					variant: 'outline',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Default');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				Button(node_7, {
					variant: 'outline',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Button');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				Button(node_8, {
					variant: 'outline',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Group');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					variant: 'outline',
					size: 'icon',
					children: ($$anchor, $$slotProps) => {
						Plus($$anchor, {});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_10 = $.sibling(node_5, 2);

	$.component(node_10, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_2) => {
		ButtonGroup_Root_2($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_11 = $.first_child(fragment_4);

				Button(node_11, {
					variant: 'outline',
					size: 'lg',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Large');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					variant: 'outline',
					size: 'lg',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Button');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				Button(node_13, {
					variant: 'outline',
					size: 'lg',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('Group');

						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_13, 2);

				Button(node_14, {
					variant: 'outline',
					size: 'icon-lg',
					children: ($$anchor, $$slotProps) => {
						Plus($$anchor, {});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}