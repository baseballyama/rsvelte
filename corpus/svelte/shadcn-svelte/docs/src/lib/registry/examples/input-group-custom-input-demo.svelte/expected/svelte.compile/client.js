import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

var root = $.from_html(`<textarea data-slot="input-group-control" class="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm" placeholder="Autoresize textarea..."></textarea> <!>`, 1);
var root_1 = $.from_html(`<div class="grid w-full max-w-sm gap-6"><!></div>`);

export default function Input_group_custom_input_demo($$anchor) {
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.sibling($.first_child(fragment), 2);

				$.component(node_1, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						align: 'block-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
								InputGroup_Button($$anchor, {
									class: 'ms-auto',
									size: 'sm',
									variant: 'default',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Submit');

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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}