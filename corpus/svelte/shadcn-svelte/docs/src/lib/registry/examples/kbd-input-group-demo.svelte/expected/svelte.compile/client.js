import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SearchIcon from "@lucide/svelte/icons/search";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex w-full max-w-xs flex-col gap-6"><!></div>`);

export default function Kbd_input_group_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { placeholder: 'Search...' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							SearchIcon($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => Kbd.Root, ($$anchor, Kbd_Root) => {
								Kbd_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('⌘');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
								Kbd_Root_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('K');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
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