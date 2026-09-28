import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button_group_nested($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_1) => {
					ButtonGroup_Root_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							Button(node_2, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('1');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Button(node_3, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('2');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Button(node_4, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('3');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							Button(node_5, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('4');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Button(node_6, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('5');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_1, 2);

				$.component(node_7, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_2) => {
					ButtonGroup_Root_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_8 = $.first_child(fragment_3);

							Button(node_8, {
								variant: 'outline',
								size: 'icon-sm',
								'aria-label': 'Previous',
								children: ($$anchor, $$slotProps) => {
									ArrowLeft($$anchor, {});
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Button(node_9, {
								variant: 'outline',
								size: 'icon-sm',
								'aria-label': 'Next',
								children: ($$anchor, $$slotProps) => {
									ArrowRight($$anchor, {});
								},
								$$slots: { default: true }
							});

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