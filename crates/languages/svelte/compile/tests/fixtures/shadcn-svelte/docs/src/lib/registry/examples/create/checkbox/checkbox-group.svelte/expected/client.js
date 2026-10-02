import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Checkbox from "$lib/registry/ui/checkbox/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Checkbox_group($$anchor) {
	Example($$anchor, {
		title: 'Group',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Show these items on the desktop:');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Checkbox.Root, ($$anchor, Checkbox_Root) => {
										Checkbox_Root($$anchor, { id: 'finder-pref-9k2-hard-disks-ljj' });
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'finder-pref-9k2-hard-disks-ljj',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Hard disks');

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

						var node_5 = $.sibling(node_2, 2);

						$.component(node_5, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => Checkbox.Root, ($$anchor, Checkbox_Root_1) => {
										Checkbox_Root_1($$anchor, { id: 'finder-pref-9k2-external-disks-1yg' });
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'finder-pref-9k2-external-disks-1yg',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('External disks');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_5, 2);

						$.component(node_8, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_9 = $.first_child(fragment_5);

									$.component(node_9, () => Checkbox.Root, ($$anchor, Checkbox_Root_2) => {
										Checkbox_Root_2($$anchor, { id: 'finder-pref-9k2-cds-dvds-fzt' });
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'finder-pref-9k2-cds-dvds-fzt',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('CDs, DVDs, and iPods');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_8, 2);

						$.component(node_11, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								orientation: 'horizontal',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_12 = $.first_child(fragment_6);

									$.component(node_12, () => Checkbox.Root, ($$anchor, Checkbox_Root_3) => {
										Checkbox_Root_3($$anchor, { id: 'finder-pref-9k2-connected-servers-6l2' });
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'finder-pref-9k2-connected-servers-6l2',
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Connected servers');

												$.append($$anchor, text_4);
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
}