import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid grid-cols-2 gap-4"><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="w-full max-w-md space-y-6"><!></div>`);

export default function Field_field_set_demo($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Field.Set, ($$anchor, Field_Set) => {
		Field_Set($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Legend, ($$anchor, Field_Legend) => {
					Field_Legend($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Address Information');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Field.Description, ($$anchor, Field_Description) => {
					Field_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('We need your address to deliver your order.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Field.Group, ($$anchor, Field_Group) => {
					Field_Group($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_4 = $.first_child(fragment_1);

							$.component(node_4, () => Field.Field, ($$anchor, Field_Field) => {
								Field_Field($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Field.Label, ($$anchor, Field_Label) => {
											Field_Label($$anchor, {
												for: 'street',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Street Address');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										Input(node_6, { id: 'street', type: 'text', placeholder: '123 Main St' });
										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var div_1 = $.sibling(node_4, 2);
							var node_7 = $.child(div_1);

							$.component(node_7, () => Field.Field, ($$anchor, Field_Field_1) => {
								Field_Field_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_8 = $.first_child(fragment_3);

										$.component(node_8, () => Field.Label, ($$anchor, Field_Label_1) => {
											Field_Label_1($$anchor, {
												for: 'city',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('City');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										Input(node_9, { id: 'city', type: 'text', placeholder: 'New York' });
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_7, 2);

							$.component(node_10, () => Field.Field, ($$anchor, Field_Field_2) => {
								Field_Field_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_11 = $.first_child(fragment_4);

										$.component(node_11, () => Field.Label, ($$anchor, Field_Label_2) => {
											Field_Label_2($$anchor, {
												for: 'zip',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Postal Code');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_11, 2);

										Input(node_12, { id: 'zip', type: 'text', placeholder: '90502' });
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_1);
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