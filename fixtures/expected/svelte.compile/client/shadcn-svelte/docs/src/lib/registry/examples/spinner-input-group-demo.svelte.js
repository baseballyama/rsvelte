import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Send</span>`, 1);
var root_2 = $.from_html(`<!> Validating... <!>`, 1);
var root_3 = $.from_html(`<div class="flex w-full max-w-md flex-col gap-4"><!> <!></div>`);

export default function Spinner_input_group_demo($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { placeholder: 'Send a message...', disabled: true });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							Spinner($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
					InputGroup_Textarea($$anchor, { placeholder: 'Send a message...', disabled: true });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'block-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_6 = $.first_child(fragment_3);

							Spinner(node_6, {});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
								InputGroup_Button($$anchor, {
									class: 'ms-auto',
									variant: 'default',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_8 = $.first_child(fragment_4);

										ArrowUpIcon(node_8, {});
										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}