import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Get notified when tasks you've created have updates. <a href="#/">Manage tasks</a>`, 1);
var root_3 = $.from_html(`<div class="w-full max-w-md"><!></div>`);

export default function Field_field_group_demo($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
		Field_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Set, ($$anchor, Field_Set) => {
					Field_Set($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
								Field_Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Responses');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Field.Description, ($$anchor, Field_Description) => {
								Field_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Get notified when ChatGPT responds to requests that take time, like research or image\n				generation.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Field.Group, ($$anchor, Field_Group_1) => {
								Field_Group_1($$anchor, {
									'data-slot': 'checkbox-group',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_6 = $.first_child(fragment_3);

													Checkbox(node_6, { id: 'push', checked: true, disabled: true });

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'push',
															class: 'font-normal',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Push notifications');

																$.append($$anchor, text_2);
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
				});

				var node_8 = $.sibling(node_1, 2);

				$.component(node_8, () => Field.Separator, ($$anchor, Field_Separator) => {
					Field_Separator($$anchor, {});
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => Field.Set, ($$anchor, Field_Set_1) => {
					Field_Set_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_10 = $.first_child(fragment_4);

							$.component(node_10, () => Field.Label, ($$anchor, Field_Label_2) => {
								Field_Label_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Tasks');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Field.Description, ($$anchor, Field_Description_1) => {
								Field_Description_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_5 = root_2();

										$.next();
										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Field.Group, ($$anchor, Field_Group_2) => {
								Field_Group_2($$anchor, {
									'data-slot': 'checkbox-group',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_13 = $.first_child(fragment_6);

										$.component(node_13, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_14 = $.first_child(fragment_7);

													Checkbox(node_14, { id: 'push-tasks' });

													var node_15 = $.sibling(node_14, 2);

													$.component(node_15, () => Field.Label, ($$anchor, Field_Label_3) => {
														Field_Label_3($$anchor, {
															for: 'push-tasks',
															class: 'font-normal',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Push notifications');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_13, 2);

										$.component(node_16, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root();
													var node_17 = $.first_child(fragment_8);

													Checkbox(node_17, { id: 'email-tasks' });

													var node_18 = $.sibling(node_17, 2);

													$.component(node_18, () => Field.Label, ($$anchor, Field_Label_4) => {
														Field_Label_4($$anchor, {
															for: 'email-tasks',
															class: 'font-normal',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Email notifications');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
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