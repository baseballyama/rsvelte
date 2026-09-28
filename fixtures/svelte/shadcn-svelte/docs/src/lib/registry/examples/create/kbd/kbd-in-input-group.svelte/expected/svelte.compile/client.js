import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Kbd_in_input_group($$anchor) {
	Example($$anchor, {
		title: 'InputGroup',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
				InputGroup_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
							InputGroup_Input($$anchor, {});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
							InputGroup_Addon($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Kbd.Root, ($$anchor, Kbd_Root) => {
										Kbd_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Space');

												$.append($$anchor, text);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}