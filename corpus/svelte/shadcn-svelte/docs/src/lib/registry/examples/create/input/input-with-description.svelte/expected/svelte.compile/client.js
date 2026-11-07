import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Input_with_description($$anchor) {
	Example($$anchor, {
		title: 'With Description',
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
								for: 'input-demo-username',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Username');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Input.Root, ($$anchor, Input_Root) => {
							Input_Root($$anchor, {
								id: 'input-demo-username',
								type: 'text',
								placeholder: 'Enter your username'
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Field.Description, ($$anchor, Field_Description) => {
							Field_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Choose a unique username for your account.');

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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}