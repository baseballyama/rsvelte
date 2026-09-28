import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Link2Icon from "@lucide/svelte/icons/link-2";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Label from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid w-full max-w-sm gap-6"><!></div>`);

export default function Input_group_button_group_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => ButtonGroup.Text, ($$anchor, ButtonGroup_Text) => {
					ButtonGroup_Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Label.Root, ($$anchor, Label_Root) => {
								Label_Root($$anchor, {
									for: 'url',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('https://');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
					InputGroup_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
								InputGroup_Input($$anchor, { id: 'url' });
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
								InputGroup_Addon($$anchor, {
									align: 'inline-end',
									children: ($$anchor, $$slotProps) => {
										Link2Icon($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_3, 2);

				$.component(node_6, () => ButtonGroup.Text, ($$anchor, ButtonGroup_Text_1) => {
					ButtonGroup_Text_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('.com');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}