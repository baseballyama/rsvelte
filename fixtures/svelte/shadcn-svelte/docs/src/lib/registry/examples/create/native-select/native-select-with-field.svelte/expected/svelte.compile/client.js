import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Native_select_with_field($$anchor) {
	Example($$anchor, {
		title: 'With Field',
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
								for: 'native-select-country',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Country');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
							NativeSelect_Root($$anchor, {
								id: 'native-select-country',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
										NativeSelect_Option($$anchor, {
											value: '',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Select a country');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
										NativeSelect_Option_1($$anchor, {
											value: 'us',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('United States');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
										NativeSelect_Option_2($$anchor, {
											value: 'uk',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('United Kingdom');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
										NativeSelect_Option_3($$anchor, {
											value: 'ca',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Canada');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_4) => {
										NativeSelect_Option_4($$anchor, {
											value: 'au',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Australia');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_2, 2);

						$.component(node_8, () => Field.Description, ($$anchor, Field_Description) => {
							Field_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Select your country of residence.');

									$.append($$anchor, text_6);
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