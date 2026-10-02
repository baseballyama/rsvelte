import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Checkbox from "$lib/registry/ui/checkbox/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Checkbox_with_description($$anchor) {
	Example($$anchor, {
		title: 'With Description',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					orientation: 'horizontal',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Checkbox.Root, ($$anchor, Checkbox_Root) => {
							Checkbox_Root($$anchor, { id: 'terms-2', checked: true });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Field.Content, ($$anchor, Field_Content) => {
							Field_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'terms-2',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Accept terms and conditions');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('By clicking this checkbox, you agree to the terms and conditions.');

												$.append($$anchor, text_1);
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