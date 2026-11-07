import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mdiAccount,
	mdiAccountMultipleOutline,
	mdiAccountOutline,
	mdiChevronDown
} from '@mdi/js';

import {
	Button,
	Checkbox,
	Field,
	Icon,
	Input,
	Switch,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="grid grid-flow-col gap-2"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<input type="date" class="text-sm w-full outline-none bg-surface-100"/>`);
var root_3 = $.from_html(`<input type="number" class="w-full outline-none bg-surface-100"/>`);
var root_4 = $.from_html(`<select class="text-sm w-full outline-none appearance-none cursor-pointer bg-surface-100"><option>First</option><option>Second</option><option>Third</option><option>Fourth</option></select>`);
var root_5 = $.from_html(`<span slot="append"><!></span>`);
var root_6 = $.from_html(`<div class="grid gap-4"><!> <!> <!></div>`);
var root_7 = $.from_html(`<h1>Examples</h1> <h2>Text (display only) as value</h2> <!> <h2>Text (display only) as slot</h2> <!> <h2>Empty (null / undefined)</h2> <!> <h2>Placeholder</h2> <!> <h2>Switch</h2> <!> <h2>Checkbox</h2> <!> <h2>Checkbox w/ error</h2> <!> <div class="grid grid-cols-2 gap-2"><div><div class="text-lg font-semibold mt-8 ml-2">ToggleGroup</div> <div class="text-xs font-semibold text-surface-content/50 mb-1 ml-2">default width</div> <!></div> <div><div class="text-lg font-semibold mt-8 ml-2">ToggleGroup</div> <div class="text-xs font-semibold text-surface-content/50 mb-1 ml-2">full width</div> <!></div> <div><div class="text-lg font-semibold mt-8 ml-2">ToggleGroup</div> <div class="text-xs font-semibold text-surface-content/50 mb-1 ml-2">full rounded and small</div> <!></div> <div><div class="text-lg font-semibold mt-8 ml-2">ToggleGroup</div> <div class="text-xs font-semibold text-surface-content/50 mb-1 ml-2">with icons</div> <!></div></div> <h2>Button</h2> <!> <h2>Date input</h2> <!> <h2>input type="number"</h2> <!> <h2>Input</h2> <!> <h2>Select</h2> <!> <h2>Label placement</h2> <!>`, 1);

export default function _page($$anchor) {
	const binding_group = [];
	let group = [];
	var fragment = root_7();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_1 = $.child(div);

			Field(node_1, { label: 'First Name', value: 'Sean' });

			var node_2 = $.sibling(node_1, 2);

			Field(node_2, { label: 'Last Name', value: 'Lynch' });
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_4 = $.child(div_1);

			Field(node_4, {
				label: 'First Name',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Sean');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Field(node_5, {
				label: 'Last Name',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Lynch');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root();
			var node_7 = $.child(div_2);

			Field(node_7, { label: 'First name', value: null });

			var node_8 = $.sibling(node_7, 2);

			Field(node_8, { label: 'Last name', value: undefined });
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_6, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root();
			var node_10 = $.child(div_3);

			Field(node_10, { label: 'First name', value: null, placeholder: 'empty' });

			var node_11 = $.sibling(node_10, 2);

			Field(node_11, { label: 'Last name', value: undefined, placeholder: 'empty' });
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_9, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Is Active',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);

						Switch($$anchor, {
							get id() {
								return $.get(id);
							}
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Fruits',
				classes: { input: 'flex flex-col gap-3' },
				clearable: true,
				get value() {
					return group;
				},

				set value($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_14 = $.first_child(fragment_4);

					Checkbox(node_14, {
						value: 'apple',
						class: 'w-full',
						get group() {
							return group;
						},

						set group($$value) {
							group = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Apple');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Checkbox(node_15, {
						value: 'banana',
						class: 'w-full',
						get group() {
							return group;
						},

						set group($$value) {
							group = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Banana');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Checkbox(node_16, {
						value: 'strawberry',
						class: 'w-full',
						get group() {
							return group;
						},

						set group($$value) {
							group = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Strawberry');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_13, 4);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Fruits',
				classes: { input: 'flex flex-col gap-3' },
				clearable: true,
				error: true,
				get value() {
					return group;
				},

				set value($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_18 = $.first_child(fragment_6);

					Checkbox(node_18, {
						value: 'apple',
						class: 'w-full',
						get group() {
							return group;
						},

						set group($$value) {
							group = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Apple');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					Checkbox(node_19, {
						value: 'banana',
						class: 'w-full',
						get group() {
							return group;
						},

						set group($$value) {
							group = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Banana');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_19, 2);

					Checkbox(node_20, {
						value: 'strawberry',
						class: 'w-full',
						get group() {
							return group;
						},

						set group($$value) {
							group = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Strawberry');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_4 = $.sibling(node_17, 2);
	var div_5 = $.child(div_4);
	var node_21 = $.sibling($.child(div_5), 4);

	Preview(node_21, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Is Active',
				children: ($$anchor, $$slotProps) => {
					ToggleGroup($$anchor, {
						variant: 'outline',
						inset: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_1();
							var node_22 = $.first_child(fragment_9);

							ToggleOption(node_22, {
								value: 'yes',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Yes');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							ToggleOption(node_23, {
								value: 'no',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('No');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_24 = $.sibling(node_23, 2);

							ToggleOption(node_24, {
								value: 'all',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('All');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_25 = $.sibling($.child(div_6), 4);

	Preview(node_25, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Is Active',
				children: ($$anchor, $$slotProps) => {
					ToggleGroup($$anchor, {
						variant: 'outline',
						inset: true,
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_1();
							var node_26 = $.first_child(fragment_12);

							ToggleOption(node_26, {
								value: 'yes',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('Yes');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});

							var node_27 = $.sibling(node_26, 2);

							ToggleOption(node_27, {
								value: 'no',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('No');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							var node_28 = $.sibling(node_27, 2);

							ToggleOption(node_28, {
								value: 'all',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('All');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_29 = $.sibling($.child(div_7), 4);

	Preview(node_29, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Is Active',
				children: ($$anchor, $$slotProps) => {
					ToggleGroup($$anchor, {
						variant: 'outline',
						inset: true,
						rounded: 'full',
						size: 'sm',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root_1();
							var node_30 = $.first_child(fragment_15);

							ToggleOption(node_30, {
								value: 'yes',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('Yes');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							var node_31 = $.sibling(node_30, 2);

							ToggleOption(node_31, {
								value: 'no',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_15 = $.text('No');

									$.append($$anchor, text_15);
								},
								$$slots: { default: true }
							});

							var node_32 = $.sibling(node_31, 2);

							ToggleOption(node_32, {
								value: 'all',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_16 = $.text('All');

									$.append($$anchor, text_16);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_33 = $.sibling($.child(div_8), 4);

	Preview(node_33, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Is Active',
				children: ($$anchor, $$slotProps) => {
					ToggleGroup($$anchor, {
						variant: 'outline',
						inset: true,
						rounded: 'full',
						children: ($$anchor, $$slotProps) => {
							var fragment_18 = root_1();
							var node_34 = $.first_child(fragment_18);

							ToggleOption(node_34, {
								value: 'yes',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										get data() {
											return mdiAccount;
										}
									});
								},
								$$slots: { default: true }
							});

							var node_35 = $.sibling(node_34, 2);

							ToggleOption(node_35, {
								value: 'no',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										get data() {
											return mdiAccountOutline;
										}
									});
								},
								$$slots: { default: true }
							});

							var node_36 = $.sibling(node_35, 2);

							ToggleOption(node_36, {
								value: 'all',
								children: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										get data() {
											return mdiAccountMultipleOutline;
										}
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_18);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_8);
	$.reset(div_4);

	var node_37 = $.sibling(div_4, 4);

	Preview(node_37, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Action',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);

						Button($$anchor, {
							get id() {
								return $.get(id);
							},
							$$events: { click: () => console.log('clicked') },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_17 = $.text('Click me');

								$.append($$anchor, text_17);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_38 = $.sibling(node_37, 4);

	Preview(node_38, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Date of Birth',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);
						var input = root_2();

						$.template_effect(() => $.set_attribute(input, 'id', $.get(id)));
						$.append($$anchor, input);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_39 = $.sibling(node_38, 4);

	Preview(node_39, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Number',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);
						var input_1 = root_3();

						$.set_attribute(input_1, 'min', 0);
						$.set_attribute(input_1, 'max', 10);
						$.set_attribute(input_1, 'step', 1);
						$.template_effect(() => $.set_attribute(input_1, 'id', $.get(id)));
						$.append($$anchor, input_1);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_40 = $.sibling(node_39, 4);

	Preview(node_40, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Phone number',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);

						Input($$anchor, {
							get id() {
								return $.get(id);
							},
							mask: '+1 (___) ___-____',
							replace: '_'
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_41 = $.sibling(node_40, 4);

	Preview(node_41, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Position',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);
						var select = root_4();
						var option = $.child(select);

						option.value = option.__value = 1;

						var option_1 = $.sibling(option);

						option_1.value = option_1.__value = 2;

						var option_2 = $.sibling(option_1);

						option_2.value = option_2.__value = 3;

						var option_3 = $.sibling(option_2);

						option_3.value = option_3.__value = 4;
						$.reset(select);
						$.template_effect(() => $.set_attribute(select, 'id', $.get(id)));
						$.append($$anchor, select);
					},

					append: ($$anchor, $$slotProps) => {
						var span = root_5();
						var node_42 = $.child(span);

						Icon(node_42, {
							get data() {
								return mdiChevronDown;
							}
						});

						$.reset(span);
						$.append($$anchor, span);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_43 = $.sibling(node_41, 4);

	Preview(node_43, {
		children: ($$anchor, $$slotProps) => {
			var div_9 = root_6();
			var node_44 = $.child(div_9);

			Field(node_44, {
				label: 'Name',
				labelPlacement: 'inset',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_18 = $.text('Sean Lynch');

					$.append($$anchor, text_18);
				},
				$$slots: { default: true }
			});

			var node_45 = $.sibling(node_44, 2);

			Field(node_45, {
				label: 'Name',
				labelPlacement: 'top',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('Sean Lynch');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			var node_46 = $.sibling(node_45, 2);

			Field(node_46, {
				label: 'Name',
				labelPlacement: 'left',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('Sean Lynch');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.append($$anchor, div_9);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}