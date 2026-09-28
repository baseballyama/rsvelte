import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="w-full max-w-md"><!></div>`);

export default function Field_checkbox_demo($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
		Field_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Set, ($$anchor, Field_Set) => {
					Field_Set($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Field.Legend, ($$anchor, Field_Legend) => {
								Field_Legend($$anchor, {
									variant: 'label',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Show these items on the desktop');

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

										var text_1 = $.text('Select the items you want to show on the desktop.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Field.Group, ($$anchor, Field_Group_1) => {
								Field_Group_1($$anchor, {
									class: 'gap-3',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_6 = $.first_child(fragment_3);

													Checkbox(node_6, { id: 'finder-pref-9k2-hard-disks-ljj', checked: true });

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'finder-pref-9k2-hard-disks-ljj',
															class: 'font-normal',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Hard disks');

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

										var node_8 = $.sibling(node_5, 2);

										$.component(node_8, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_9 = $.first_child(fragment_4);

													Checkbox(node_9, { id: 'finder-pref-9k2-external-disks-1yg' });

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'finder-pref-9k2-external-disks-1yg',
															class: 'font-normal',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('External disks');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_8, 2);

										$.component(node_11, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_12 = $.first_child(fragment_5);

													Checkbox(node_12, { id: 'finder-pref-9k2-cds-dvds-fzt' });

													var node_13 = $.sibling(node_12, 2);

													$.component(node_13, () => Field.Label, ($$anchor, Field_Label_2) => {
														Field_Label_2($$anchor, {
															for: 'finder-pref-9k2-cds-dvds-fzt',
															class: 'font-normal',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('CDs, DVDs, and iPods');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_11, 2);

										$.component(node_14, () => Field.Field, ($$anchor, Field_Field_3) => {
											Field_Field_3($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_15 = $.first_child(fragment_6);

													Checkbox(node_15, { id: 'finder-pref-9k2-connected-servers-6l2' });

													var node_16 = $.sibling(node_15, 2);

													$.component(node_16, () => Field.Label, ($$anchor, Field_Label_3) => {
														Field_Label_3($$anchor, {
															for: 'finder-pref-9k2-connected-servers-6l2',
															class: 'font-normal',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Connected servers');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
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

				var node_17 = $.sibling(node_1, 2);

				$.component(node_17, () => Field.Separator, ($$anchor, Field_Separator) => {
					Field_Separator($$anchor, {});
				});

				var node_18 = $.sibling(node_17, 2);

				$.component(node_18, () => Field.Field, ($$anchor, Field_Field_4) => {
					Field_Field_4($$anchor, {
						orientation: 'horizontal',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_19 = $.first_child(fragment_7);

							Checkbox(node_19, { id: 'finder-pref-9k2-sync-folders-nep', checked: true });

							var node_20 = $.sibling(node_19, 2);

							$.component(node_20, () => Field.Content, ($$anchor, Field_Content) => {
								Field_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_21 = $.first_child(fragment_8);

										$.component(node_21, () => Field.Label, ($$anchor, Field_Label_4) => {
											Field_Label_4($$anchor, {
												for: 'finder-pref-9k2-sync-folders-nep',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Sync Desktop & Documents folders');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_22 = $.sibling(node_21, 2);

										$.component(node_22, () => Field.Description, ($$anchor, Field_Description_1) => {
											Field_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Your Desktop & Documents folders are being synced with iCloud Drive. You can access them\n					from other devices.');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
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