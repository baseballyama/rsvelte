import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Spinner_in_input_group($$anchor) {
	Example($$anchor, {
		title: 'In Input Group',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'input-group-spinner',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Input Group');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
							InputGroup_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
										InputGroup_Input($$anchor, { id: 'input-group-spinner' });
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
										InputGroup_Addon($$anchor, {
											children: ($$anchor, $$slotProps) => {
												Spinner($$anchor, {});
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