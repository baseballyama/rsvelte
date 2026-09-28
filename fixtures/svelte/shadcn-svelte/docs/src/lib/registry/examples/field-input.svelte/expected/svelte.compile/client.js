import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="w-full max-w-md"><!></div>`);

export default function Field_input($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Field.Set, ($$anchor, Field_Set) => {
		Field_Set($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Group, ($$anchor, Field_Group) => {
					Field_Group($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Field.Field, ($$anchor, Field_Field) => {
								Field_Field($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Field.Label, ($$anchor, Field_Label) => {
											Field_Label($$anchor, {
												for: 'username',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Username');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										Input(node_4, { id: 'username', type: 'text', placeholder: 'Max Leiter' });

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Field.Description, ($$anchor, Field_Description) => {
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

							var node_6 = $.sibling(node_2, 2);

							$.component(node_6, () => Field.Field, ($$anchor, Field_Field_1) => {
								Field_Field_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_7 = $.first_child(fragment_3);

										$.component(node_7, () => Field.Label, ($$anchor, Field_Label_1) => {
											Field_Label_1($$anchor, {
												for: 'password',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Password');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => Field.Description, ($$anchor, Field_Description_1) => {
											Field_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Must be at least 8 characters long.');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										Input(node_9, { id: 'password', type: 'password', placeholder: '••••••••' });
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}