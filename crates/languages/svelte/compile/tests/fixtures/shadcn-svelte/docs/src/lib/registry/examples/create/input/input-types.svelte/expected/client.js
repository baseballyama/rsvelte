import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full flex-col gap-6"><!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function Input_types($$anchor) {
	Example($$anchor, {
		title: 'Input Types',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'input-demo-password',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Password');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Input.Root, ($$anchor, Input_Root) => {
							Input_Root($$anchor, {
								id: 'input-demo-password',
								type: 'password',
								placeholder: 'Password'
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			$.component(node_3, () => Field.Field, ($$anchor, Field_Field_1) => {
				Field_Field_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_4 = $.first_child(fragment_2);

						$.component(node_4, () => Field.Label, ($$anchor, Field_Label_1) => {
							Field_Label_1($$anchor, {
								for: 'input-demo-tel',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Phone');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => Input.Root, ($$anchor, Input_Root_1) => {
							Input_Root_1($$anchor, {
								id: 'input-demo-tel',
								type: 'tel',
								placeholder: '+1 (555) 123-4567'
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_3, 2);

			$.component(node_6, () => Field.Field, ($$anchor, Field_Field_2) => {
				Field_Field_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_7 = $.first_child(fragment_3);

						$.component(node_7, () => Field.Label, ($$anchor, Field_Label_2) => {
							Field_Label_2($$anchor, {
								for: 'input-demo-url',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('URL');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Input.Root, ($$anchor, Input_Root_2) => {
							Input_Root_2($$anchor, {
								id: 'input-demo-url',
								type: 'url',
								placeholder: 'https://example.com'
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_9 = $.sibling(node_6, 2);

			$.component(node_9, () => Field.Field, ($$anchor, Field_Field_3) => {
				Field_Field_3($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_10 = $.first_child(fragment_4);

						$.component(node_10, () => Field.Label, ($$anchor, Field_Label_3) => {
							Field_Label_3($$anchor, {
								for: 'input-demo-search',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Search');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => Input.Root, ($$anchor, Input_Root_3) => {
							Input_Root_3($$anchor, {
								id: 'input-demo-search',
								type: 'search',
								placeholder: 'Search'
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node_9, 2);

			$.component(node_12, () => Field.Field, ($$anchor, Field_Field_4) => {
				Field_Field_4($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_13 = $.first_child(fragment_5);

						$.component(node_13, () => Field.Label, ($$anchor, Field_Label_4) => {
							Field_Label_4($$anchor, {
								for: 'input-demo-number',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Number');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_13, 2);

						$.component(node_14, () => Input.Root, ($$anchor, Input_Root_4) => {
							Input_Root_4($$anchor, { id: 'input-demo-number', type: 'number', placeholder: '123' });
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			var node_15 = $.sibling(node_12, 2);

			$.component(node_15, () => Field.Field, ($$anchor, Field_Field_5) => {
				Field_Field_5($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root();
						var node_16 = $.first_child(fragment_6);

						$.component(node_16, () => Field.Label, ($$anchor, Field_Label_5) => {
							Field_Label_5($$anchor, {
								for: 'input-demo-date',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Date');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						var node_17 = $.sibling(node_16, 2);

						$.component(node_17, () => Input.Root, ($$anchor, Input_Root_5) => {
							Input_Root_5($$anchor, { id: 'input-demo-date', type: 'date' });
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			var node_18 = $.sibling(node_15, 2);

			$.component(node_18, () => Field.Field, ($$anchor, Field_Field_6) => {
				Field_Field_6($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root();
						var node_19 = $.first_child(fragment_7);

						$.component(node_19, () => Field.Label, ($$anchor, Field_Label_6) => {
							Field_Label_6($$anchor, {
								for: 'input-demo-time',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Time');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						});

						var node_20 = $.sibling(node_19, 2);

						$.component(node_20, () => Input.Root, ($$anchor, Input_Root_6) => {
							Input_Root_6($$anchor, { id: 'input-demo-time', type: 'time' });
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			var node_21 = $.sibling(node_18, 2);

			$.component(node_21, () => Field.Field, ($$anchor, Field_Field_7) => {
				Field_Field_7($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root();
						var node_22 = $.first_child(fragment_8);

						$.component(node_22, () => Field.Label, ($$anchor, Field_Label_7) => {
							Field_Label_7($$anchor, {
								for: 'input-demo-file',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('File');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						});

						var node_23 = $.sibling(node_22, 2);

						$.component(node_23, () => Input.Root, ($$anchor, Input_Root_7) => {
							Input_Root_7($$anchor, { id: 'input-demo-file', type: 'file' });
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}