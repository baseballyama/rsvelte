import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ApiDocs,
	Button,
	Field,
	Radio,
	ToggleGroup,
	ToggleOption,
	TogglePanel
} from 'svelte-ux';

import Preview from '$lib/components/Preview.svelte';
import toggleGroupApi from '$lib/components/ToggleGroup.svelte?raw&sveld';
import toggleOptionApi from '$lib/components/ToggleOption.svelte?raw&sveld';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="mt-2 p-4 bg-surface-content/5 rounded border"><!> <!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="inline-grid gap-2"><!> <!> <!> <!> <!> <!></div>`);
var root_6 = $.from_html(`<h3> </h3> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<h1>Playground</h1> <div class="grid gap-2"><div><!></div> <!> <div class="grid md:grid-cols-3 gap-2"><!> <!> <!> <!> <!> <!></div></div> <h1>Examples</h1> <h2>Variants</h2> <!> <h2>Vertical layout</h2> <!> <h2>Vertical with fixed width</h2> <!> <h2>Left aligned tabs with fixed height</h2> <!> <h2>Grid layout</h2> <!> <h2>Circle</h2> <!> <h2>Controlled</h2> <!> <div class="mt-4">Select: <!> <!> <!> <!></div> <h2>Controlled with null option</h2> <!> <div class="mt-4">Select: <!> <!> <!> <!></div> <h2>Controlled with undefined option</h2> <!> <div class="mt-4">Select: <!> <!> <!> <!></div> <h2>Controlled (object value)</h2> <!> <div class="mt-4">Select: <!> <!> <!> <!></div> <h2>Overflow scrollIntoView</h2> <!> <div class="mt-4">Select: <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div> <h1>ToggleGroup API</h1> <!> <h1>ToggleOption API</h1> <!>`, 1);

export default function _page($$anchor) {
	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];
	const binding_group_3 = [];
	const binding_group_4 = [];
	const binding_group_5 = [];
	const binding_group_6 = [];
	const allValue = {};
	const missedValue = {};
	const callsValue = {};
	let selected = 1;
	let selectedStr = 'all';
	let selectedObj = missedValue;
	let variant = 'default';
	let size = 'md';
	let rounded = true;
	let inset = false;
	let gap = false;
	let vertical = false;
	let showPanes = false;

	const variants = [
		'default',
		'outline',
		'fill',
		'fill-light',
		'fill-surface',
		'underline'
	];

	var fragment = root_9();
	var div = $.sibling($.first_child(fragment), 2);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				get variant() {
					return variant;
				},

				get size() {
					return size;
				},

				get rounded() {
					return rounded;
				},

				get gap() {
					return gap;
				},

				get inset() {
					return inset;
				},

				get vertical() {
					return vertical;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					ToggleOption(node_1, {
						value: 'all',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('All');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: 'missed',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Missed');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					ToggleOption(node_3, {
						value: 'calls',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Calls');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},

				$$slots: {
					default: true,
					panes: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								var div_2 = root_1();
								var node_5 = $.child(div_2);

								TogglePanel(node_5, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('All panel');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								TogglePanel(node_6, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Missed panel');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								var node_7 = $.sibling(node_6, 2);

								TogglePanel(node_7, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Calls panel');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								$.reset(div_2);
								$.append($$anchor, div_2);
							};

							$.if(node_4, ($$render) => {
								if (showPanes) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_8 = $.sibling(div_1, 2);

	Field(node_8, {
		label: 'Variant',
		classes: { input: 'flex flex-wrap gap-3' },
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_2();
			var node_9 = $.first_child(fragment_4);

			Radio(node_9, {
				name: 'variant',
				value: 'default',
				get group() {
					return variant;
				},

				set group($$value) {
					variant = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('default');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Radio(node_10, {
				name: 'variant',
				value: 'outline',
				get group() {
					return variant;
				},

				set group($$value) {
					variant = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('outline');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Radio(node_11, {
				name: 'variant',
				value: 'fill',
				get group() {
					return variant;
				},

				set group($$value) {
					variant = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('fill');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			Radio(node_12, {
				name: 'variant',
				value: 'fill-light',
				get group() {
					return variant;
				},

				set group($$value) {
					variant = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('fill-light');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Radio(node_13, {
				name: 'variant',
				value: 'fill-surface',
				get group() {
					return variant;
				},

				set group($$value) {
					variant = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('fill-surface');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Radio(node_14, {
				name: 'variant',
				value: 'underline',
				get group() {
					return variant;
				},

				set group($$value) {
					variant = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('underline');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var div_3 = $.sibling(node_8, 2);
	var node_15 = $.child(div_3);

	Field(node_15, {
		label: 'Size',
		classes: { container: 'h-full', input: 'flex gap-3 md:grid md:gap-1' },
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_16 = $.first_child(fragment_5);

			Radio(node_16, {
				name: 'size',
				value: 'xs',
				get group() {
					return size;
				},

				set group($$value) {
					size = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('xs');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			Radio(node_17, {
				name: 'size',
				value: 'sm',
				get group() {
					return size;
				},

				set group($$value) {
					size = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('sm');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			Radio(node_18, {
				name: 'size',
				value: 'md',
				get group() {
					return size;
				},

				set group($$value) {
					size = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('md');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			Radio(node_19, {
				name: 'size',
				value: 'lg',
				get group() {
					return size;
				},

				set group($$value) {
					size = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('lg');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_15, 2);

	Field(node_20, {
		label: 'Rounded',
		classes: { container: 'h-full', input: 'flex gap-3 md:grid md:gap-1' },
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_21 = $.first_child(fragment_6);

			Radio(node_21, {
				name: 'rounded',
				value: false,
				get group() {
					return rounded;
				},

				set group($$value) {
					rounded = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('false');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			Radio(node_22, {
				name: 'rounded',
				value: true,
				get group() {
					return rounded;
				},

				set group($$value) {
					rounded = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('true');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			Radio(node_23, {
				name: 'rounded',
				value: 'full',
				get group() {
					return rounded;
				},

				set group($$value) {
					rounded = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_18 = $.text('full');

					$.append($$anchor, text_18);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_20, 2);

	Field(node_24, {
		label: 'Gap',
		classes: { container: 'h-full', input: 'flex gap-3 md:grid md:gap-1' },
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_25 = $.first_child(fragment_7);

			Radio(node_25, {
				name: 'gap',
				value: false,
				get group() {
					return gap;
				},

				set group($$value) {
					gap = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('false');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_25, 2);

			Radio(node_26, {
				name: 'gap',
				value: true,
				get group() {
					return gap;
				},

				set group($$value) {
					gap = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('true');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			var node_27 = $.sibling(node_26, 2);

			Radio(node_27, {
				name: 'gap',
				value: 'px',
				get group() {
					return gap;
				},

				set group($$value) {
					gap = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('px');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_28 = $.sibling(node_24, 2);

	Field(node_28, {
		label: 'Inset',
		classes: { input: 'flex gap-3 md:grid md:gap-1' },
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_4();
			var node_29 = $.first_child(fragment_8);

			Radio(node_29, {
				name: 'inset',
				value: false,
				get group() {
					return inset;
				},

				set group($$value) {
					inset = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('false');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			var node_30 = $.sibling(node_29, 2);

			Radio(node_30, {
				name: 'inset',
				value: true,
				get group() {
					return inset;
				},

				set group($$value) {
					inset = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('true');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_31 = $.sibling(node_28, 2);

	Field(node_31, {
		label: 'Vertical',
		classes: { input: 'flex gap-3 md:grid md:gap-1' },
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_4();
			var node_32 = $.first_child(fragment_9);

			Radio(node_32, {
				name: 'vertical',
				value: false,
				get group() {
					return vertical;
				},

				set group($$value) {
					vertical = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_24 = $.text('false');

					$.append($$anchor, text_24);
				},
				$$slots: { default: true }
			});

			var node_33 = $.sibling(node_32, 2);

			Radio(node_33, {
				name: 'vertical',
				value: true,
				get group() {
					return vertical;
				},

				set group($$value) {
					vertical = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_25 = $.text('true');

					$.append($$anchor, text_25);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_34 = $.sibling(node_31, 2);

	Field(node_34, {
		label: 'Show panes',
		classes: { input: 'flex gap-3 md:grid md:gap-1' },
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_4();
			var node_35 = $.first_child(fragment_10);

			Radio(node_35, {
				name: 'panes',
				value: false,
				get group() {
					return showPanes;
				},

				set group($$value) {
					showPanes = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_26 = $.text('false');

					$.append($$anchor, text_26);
				},
				$$slots: { default: true }
			});

			var node_36 = $.sibling(node_35, 2);

			Radio(node_36, {
				name: 'panes',
				value: true,
				get group() {
					return showPanes;
				},

				set group($$value) {
					showPanes = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_27 = $.text('true');

					$.append($$anchor, text_27);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div);

	var node_37 = $.sibling(div, 6);

	$.each(node_37, 17, () => variants, $.index, ($$anchor, variant, $$index, $$array) => {
		var fragment_11 = root_6();
		var h3 = $.first_child(fragment_11);
		var text_28 = $.only_child(h3, true);
		var node_38 = $.sibling(h3, 2);

		Preview(node_38, {
			children: ($$anchor, $$slotProps) => {
				var div_4 = root_5();
				var node_39 = $.child(div_4);

				ToggleGroup(node_39, {
					get variant() {
						return $.get(variant);
					},

					get value() {
						return selectedStr;
					},

					set value($$value) {
						selectedStr = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_12 = root();
						var node_40 = $.first_child(fragment_12);

						ToggleOption(node_40, {
							value: 'all',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_29 = $.text('All');

								$.append($$anchor, text_29);
							},
							$$slots: { default: true }
						});

						var node_41 = $.sibling(node_40, 2);

						ToggleOption(node_41, {
							value: 'missed',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_30 = $.text('Missed');

								$.append($$anchor, text_30);
							},
							$$slots: { default: true }
						});

						var node_42 = $.sibling(node_41, 2);

						ToggleOption(node_42, {
							value: 'calls',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_31 = $.text('Calls');

								$.append($$anchor, text_31);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});

				var node_43 = $.sibling(node_39, 2);

				ToggleGroup(node_43, {
					get variant() {
						return $.get(variant);
					},
					rounded: false,
					get value() {
						return selectedStr;
					},

					set value($$value) {
						selectedStr = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_13 = root();
						var node_44 = $.first_child(fragment_13);

						ToggleOption(node_44, {
							value: 'all',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_32 = $.text('All');

								$.append($$anchor, text_32);
							},
							$$slots: { default: true }
						});

						var node_45 = $.sibling(node_44, 2);

						ToggleOption(node_45, {
							value: 'missed',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_33 = $.text('Missed');

								$.append($$anchor, text_33);
							},
							$$slots: { default: true }
						});

						var node_46 = $.sibling(node_45, 2);

						ToggleOption(node_46, {
							value: 'calls',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_34 = $.text('Calls');

								$.append($$anchor, text_34);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});

				var node_47 = $.sibling(node_43, 2);

				ToggleGroup(node_47, {
					get variant() {
						return $.get(variant);
					},
					rounded: 'full',
					get value() {
						return selectedStr;
					},

					set value($$value) {
						selectedStr = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_14 = root();
						var node_48 = $.first_child(fragment_14);

						ToggleOption(node_48, {
							value: 'all',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_35 = $.text('All');

								$.append($$anchor, text_35);
							},
							$$slots: { default: true }
						});

						var node_49 = $.sibling(node_48, 2);

						ToggleOption(node_49, {
							value: 'missed',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_36 = $.text('Missed');

								$.append($$anchor, text_36);
							},
							$$slots: { default: true }
						});

						var node_50 = $.sibling(node_49, 2);

						ToggleOption(node_50, {
							value: 'calls',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_37 = $.text('Calls');

								$.append($$anchor, text_37);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_14);
					},
					$$slots: { default: true }
				});

				var node_51 = $.sibling(node_47, 2);

				ToggleGroup(node_51, {
					get variant() {
						return $.get(variant);
					},
					rounded: 'full',
					inset: true,
					get value() {
						return selectedStr;
					},

					set value($$value) {
						selectedStr = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_15 = root();
						var node_52 = $.first_child(fragment_15);

						ToggleOption(node_52, {
							value: 'all',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_38 = $.text('All');

								$.append($$anchor, text_38);
							},
							$$slots: { default: true }
						});

						var node_53 = $.sibling(node_52, 2);

						ToggleOption(node_53, {
							value: 'missed',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_39 = $.text('Missed');

								$.append($$anchor, text_39);
							},
							$$slots: { default: true }
						});

						var node_54 = $.sibling(node_53, 2);

						ToggleOption(node_54, {
							value: 'calls',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_40 = $.text('Calls');

								$.append($$anchor, text_40);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_15);
					},
					$$slots: { default: true }
				});

				var node_55 = $.sibling(node_51, 2);

				ToggleGroup(node_55, {
					get variant() {
						return $.get(variant);
					},
					gap: true,
					get value() {
						return selectedStr;
					},

					set value($$value) {
						selectedStr = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_16 = root();
						var node_56 = $.first_child(fragment_16);

						ToggleOption(node_56, {
							value: 'all',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_41 = $.text('All');

								$.append($$anchor, text_41);
							},
							$$slots: { default: true }
						});

						var node_57 = $.sibling(node_56, 2);

						ToggleOption(node_57, {
							value: 'missed',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_42 = $.text('Missed');

								$.append($$anchor, text_42);
							},
							$$slots: { default: true }
						});

						var node_58 = $.sibling(node_57, 2);

						ToggleOption(node_58, {
							value: 'calls',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_43 = $.text('Calls');

								$.append($$anchor, text_43);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_16);
					},
					$$slots: { default: true }
				});

				var node_59 = $.sibling(node_55, 2);

				ToggleGroup(node_59, {
					get variant() {
						return $.get(variant);
					},
					gap: 'px',
					get value() {
						return selectedStr;
					},

					set value($$value) {
						selectedStr = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_17 = root();
						var node_60 = $.first_child(fragment_17);

						ToggleOption(node_60, {
							value: 'all',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_44 = $.text('All');

								$.append($$anchor, text_44);
							},
							$$slots: { default: true }
						});

						var node_61 = $.sibling(node_60, 2);

						ToggleOption(node_61, {
							value: 'missed',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_45 = $.text('Missed');

								$.append($$anchor, text_45);
							},
							$$slots: { default: true }
						});

						var node_62 = $.sibling(node_61, 2);

						ToggleOption(node_62, {
							value: 'calls',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_46 = $.text('Calls');

								$.append($$anchor, text_46);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_17);
					},
					$$slots: { default: true }
				});

				$.reset(div_4);
				$.append($$anchor, div_4);
			},
			$$slots: { default: true }
		});

		$.template_effect(() => $.set_text(text_28, $.get(variant)));
		$.append($$anchor, fragment_11);
	});

	var node_63 = $.sibling(node_37, 4);

	Preview(node_63, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				vertical: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_19 = root();
					var node_64 = $.first_child(fragment_19);

					ToggleOption(node_64, {
						value: 'all',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_47 = $.text('All');

							$.append($$anchor, text_47);
						},
						$$slots: { default: true }
					});

					var node_65 = $.sibling(node_64, 2);

					ToggleOption(node_65, {
						value: 'missed',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_48 = $.text('Missed');

							$.append($$anchor, text_48);
						},
						$$slots: { default: true }
					});

					var node_66 = $.sibling(node_65, 2);

					ToggleOption(node_66, {
						value: 'calls',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_49 = $.text('Calls');

							$.append($$anchor, text_49);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_19);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_67 = $.sibling(node_63, 4);

	Preview(node_67, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				class: 'w-[300px]',
				vertical: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_21 = root();
					var node_68 = $.first_child(fragment_21);

					ToggleOption(node_68, {
						value: 'all',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_50 = $.text('All');

							$.append($$anchor, text_50);
						},
						$$slots: { default: true }
					});

					var node_69 = $.sibling(node_68, 2);

					ToggleOption(node_69, {
						value: 'missed',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_51 = $.text('Missed');

							$.append($$anchor, text_51);
						},
						$$slots: { default: true }
					});

					var node_70 = $.sibling(node_69, 2);

					ToggleOption(node_70, {
						value: 'calls',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_52 = $.text('Calls');

							$.append($$anchor, text_52);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_21);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_71 = $.sibling(node_67, 4);

	Preview(node_71, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'underline',
				classes: { options: 'justify-start h-10' },
				children: ($$anchor, $$slotProps) => {
					var fragment_23 = root();
					var node_72 = $.first_child(fragment_23);

					ToggleOption(node_72, {
						value: 'all',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_53 = $.text('All');

							$.append($$anchor, text_53);
						},
						$$slots: { default: true }
					});

					var node_73 = $.sibling(node_72, 2);

					ToggleOption(node_73, {
						value: 'missed',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_54 = $.text('Missed');

							$.append($$anchor, text_54);
						},
						$$slots: { default: true }
					});

					var node_74 = $.sibling(node_73, 2);

					ToggleOption(node_74, {
						value: 'calls',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_55 = $.text('Calls');

							$.append($$anchor, text_55);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_23);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_75 = $.sibling(node_71, 4);

	Preview(node_75, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				classes: { options: 'grid-rows-3 grid-cols-3' },
				children: ($$anchor, $$slotProps) => {
					var fragment_25 = root_7();
					var node_76 = $.first_child(fragment_25);

					ToggleOption(node_76, {
						value: 1,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_56 = $.text('1');

							$.append($$anchor, text_56);
						},
						$$slots: { default: true }
					});

					var node_77 = $.sibling(node_76, 2);

					ToggleOption(node_77, {
						value: 2,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_57 = $.text('2');

							$.append($$anchor, text_57);
						},
						$$slots: { default: true }
					});

					var node_78 = $.sibling(node_77, 2);

					ToggleOption(node_78, {
						value: 3,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_58 = $.text('3');

							$.append($$anchor, text_58);
						},
						$$slots: { default: true }
					});

					var node_79 = $.sibling(node_78, 2);

					ToggleOption(node_79, {
						value: 4,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_59 = $.text('4');

							$.append($$anchor, text_59);
						},
						$$slots: { default: true }
					});

					var node_80 = $.sibling(node_79, 2);

					ToggleOption(node_80, {
						value: 5,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_60 = $.text('5');

							$.append($$anchor, text_60);
						},
						$$slots: { default: true }
					});

					var node_81 = $.sibling(node_80, 2);

					ToggleOption(node_81, {
						value: 6,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_61 = $.text('6');

							$.append($$anchor, text_61);
						},
						$$slots: { default: true }
					});

					var node_82 = $.sibling(node_81, 2);

					ToggleOption(node_82, {
						value: 7,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_62 = $.text('7');

							$.append($$anchor, text_62);
						},
						$$slots: { default: true }
					});

					var node_83 = $.sibling(node_82, 2);

					ToggleOption(node_83, {
						value: 8,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_63 = $.text('8');

							$.append($$anchor, text_63);
						},
						$$slots: { default: true }
					});

					var node_84 = $.sibling(node_83, 2);

					ToggleOption(node_84, {
						value: 9,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_64 = $.text('9');

							$.append($$anchor, text_64);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_25);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_85 = $.sibling(node_75, 4);

	Preview(node_85, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				rounded: 'full',
				classes: { options: 'inline-grid' },
				children: ($$anchor, $$slotProps) => {
					var fragment_27 = root();
					var node_86 = $.first_child(fragment_27);

					ToggleOption(node_86, {
						value: 1,
						class: 'h-10 aspect-square',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_65 = $.text('1');

							$.append($$anchor, text_65);
						},
						$$slots: { default: true }
					});

					var node_87 = $.sibling(node_86, 2);

					ToggleOption(node_87, {
						value: 2,
						class: 'h-10 aspect-square',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_66 = $.text('2');

							$.append($$anchor, text_66);
						},
						$$slots: { default: true }
					});

					var node_88 = $.sibling(node_87, 2);

					ToggleOption(node_88, {
						value: 3,
						class: 'h-10 aspect-square',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_67 = $.text('3');

							$.append($$anchor, text_67);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_27);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_89 = $.sibling(node_85, 4);

	Preview(node_89, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				get value() {
					return selectedStr;
				},

				set value($$value) {
					selectedStr = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_29 = root();
					var node_90 = $.first_child(fragment_29);

					ToggleOption(node_90, {
						value: 'all',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_68 = $.text('All');

							$.append($$anchor, text_68);
						},
						$$slots: { default: true }
					});

					var node_91 = $.sibling(node_90, 2);

					ToggleOption(node_91, {
						value: 'missed',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_69 = $.text('Missed');

							$.append($$anchor, text_69);
						},
						$$slots: { default: true }
					});

					var node_92 = $.sibling(node_91, 2);

					ToggleOption(node_92, {
						value: 'calls',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_70 = $.text('Calls');

							$.append($$anchor, text_70);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_29);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_5 = $.sibling(node_89, 2);
	var node_93 = $.sibling($.child(div_5));

	Button(node_93, {
		$$events: { click: () => selectedStr = 'all' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_71 = $.text('All');

			$.append($$anchor, text_71);
		},
		$$slots: { default: true }
	});

	var node_94 = $.sibling(node_93, 2);

	Button(node_94, {
		$$events: { click: () => selectedStr = 'missed' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_72 = $.text('Missed');

			$.append($$anchor, text_72);
		},
		$$slots: { default: true }
	});

	var node_95 = $.sibling(node_94, 2);

	Button(node_95, {
		$$events: { click: () => selectedStr = 'calls' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_73 = $.text('Calls');

			$.append($$anchor, text_73);
		},
		$$slots: { default: true }
	});

	var node_96 = $.sibling(node_95, 2);

	Button(node_96, {
		$$events: { click: () => selectedStr = null },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_74 = $.text('Clear');

			$.append($$anchor, text_74);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var node_97 = $.sibling(div_5, 4);

	Preview(node_97, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				get value() {
					return selectedStr;
				},

				set value($$value) {
					selectedStr = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_31 = root_3();
					var node_98 = $.first_child(fragment_31);

					ToggleOption(node_98, {
						value: null,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_75 = $.text('None');

							$.append($$anchor, text_75);
						},
						$$slots: { default: true }
					});

					var node_99 = $.sibling(node_98, 2);

					ToggleOption(node_99, {
						value: 'all',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_76 = $.text('All');

							$.append($$anchor, text_76);
						},
						$$slots: { default: true }
					});

					var node_100 = $.sibling(node_99, 2);

					ToggleOption(node_100, {
						value: 'missed',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_77 = $.text('Missed');

							$.append($$anchor, text_77);
						},
						$$slots: { default: true }
					});

					var node_101 = $.sibling(node_100, 2);

					ToggleOption(node_101, {
						value: 'calls',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_78 = $.text('Calls');

							$.append($$anchor, text_78);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_31);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_6 = $.sibling(node_97, 2);
	var node_102 = $.sibling($.child(div_6));

	Button(node_102, {
		$$events: { click: () => selectedStr = null },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_79 = $.text('None');

			$.append($$anchor, text_79);
		},
		$$slots: { default: true }
	});

	var node_103 = $.sibling(node_102, 2);

	Button(node_103, {
		$$events: { click: () => selectedStr = 'all' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_80 = $.text('All');

			$.append($$anchor, text_80);
		},
		$$slots: { default: true }
	});

	var node_104 = $.sibling(node_103, 2);

	Button(node_104, {
		$$events: { click: () => selectedStr = 'missed' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_81 = $.text('Missed');

			$.append($$anchor, text_81);
		},
		$$slots: { default: true }
	});

	var node_105 = $.sibling(node_104, 2);

	Button(node_105, {
		$$events: { click: () => selectedStr = 'calls' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_82 = $.text('Calls');

			$.append($$anchor, text_82);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var node_106 = $.sibling(div_6, 4);

	Preview(node_106, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				get value() {
					return selectedStr;
				},

				set value($$value) {
					selectedStr = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_33 = root_3();
					var node_107 = $.first_child(fragment_33);

					ToggleOption(node_107, {
						value: undefined,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_83 = $.text('None');

							$.append($$anchor, text_83);
						},
						$$slots: { default: true }
					});

					var node_108 = $.sibling(node_107, 2);

					ToggleOption(node_108, {
						value: 'all',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_84 = $.text('All');

							$.append($$anchor, text_84);
						},
						$$slots: { default: true }
					});

					var node_109 = $.sibling(node_108, 2);

					ToggleOption(node_109, {
						value: 'missed',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_85 = $.text('Missed');

							$.append($$anchor, text_85);
						},
						$$slots: { default: true }
					});

					var node_110 = $.sibling(node_109, 2);

					ToggleOption(node_110, {
						value: 'calls',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_86 = $.text('Calls');

							$.append($$anchor, text_86);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_33);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_7 = $.sibling(node_106, 2);
	var node_111 = $.sibling($.child(div_7));

	Button(node_111, {
		$$events: { click: () => selectedStr = undefined },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_87 = $.text('None');

			$.append($$anchor, text_87);
		},
		$$slots: { default: true }
	});

	var node_112 = $.sibling(node_111, 2);

	Button(node_112, {
		$$events: { click: () => selectedStr = 'all' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_88 = $.text('All');

			$.append($$anchor, text_88);
		},
		$$slots: { default: true }
	});

	var node_113 = $.sibling(node_112, 2);

	Button(node_113, {
		$$events: { click: () => selectedStr = 'missed' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_89 = $.text('Missed');

			$.append($$anchor, text_89);
		},
		$$slots: { default: true }
	});

	var node_114 = $.sibling(node_113, 2);

	Button(node_114, {
		$$events: { click: () => selectedStr = 'calls' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_90 = $.text('Calls');

			$.append($$anchor, text_90);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var node_115 = $.sibling(div_7, 4);

	Preview(node_115, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				get value() {
					return selectedObj;
				},

				set value($$value) {
					selectedObj = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_35 = root();
					var node_116 = $.first_child(fragment_35);

					ToggleOption(node_116, {
						get value() {
							return allValue;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_91 = $.text('All');

							$.append($$anchor, text_91);
						},
						$$slots: { default: true }
					});

					var node_117 = $.sibling(node_116, 2);

					ToggleOption(node_117, {
						get value() {
							return missedValue;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_92 = $.text('Missed');

							$.append($$anchor, text_92);
						},
						$$slots: { default: true }
					});

					var node_118 = $.sibling(node_117, 2);

					ToggleOption(node_118, {
						get value() {
							return callsValue;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_93 = $.text('Calls');

							$.append($$anchor, text_93);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_35);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_8 = $.sibling(node_115, 2);
	var node_119 = $.sibling($.child(div_8));

	Button(node_119, {
		$$events: { click: () => selectedObj = allValue },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_94 = $.text('All');

			$.append($$anchor, text_94);
		},
		$$slots: { default: true }
	});

	var node_120 = $.sibling(node_119, 2);

	Button(node_120, {
		$$events: { click: () => selectedObj = missedValue },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_95 = $.text('Missed');

			$.append($$anchor, text_95);
		},
		$$slots: { default: true }
	});

	var node_121 = $.sibling(node_120, 2);

	Button(node_121, {
		$$events: { click: () => selectedObj = callsValue },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_96 = $.text('Calls');

			$.append($$anchor, text_96);
		},
		$$slots: { default: true }
	});

	var node_122 = $.sibling(node_121, 2);

	Button(node_122, {
		$$events: { click: () => selectedObj = null },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_97 = $.text('Clear');

			$.append($$anchor, text_97);
		},
		$$slots: { default: true }
	});

	$.reset(div_8);

	var node_123 = $.sibling(div_8, 4);

	Preview(node_123, {
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				get value() {
					return selected;
				},
				classes: { options: 'w-full overflow-auto scrollbar-none' },
				autoscroll: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_37 = root_8();
					var node_124 = $.first_child(fragment_37);

					ToggleOption(node_124, {
						value: 1,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_98 = $.text('One');

							$.append($$anchor, text_98);
						},
						$$slots: { default: true }
					});

					var node_125 = $.sibling(node_124, 2);

					ToggleOption(node_125, {
						value: 2,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_99 = $.text('Two');

							$.append($$anchor, text_99);
						},
						$$slots: { default: true }
					});

					var node_126 = $.sibling(node_125, 2);

					ToggleOption(node_126, {
						value: 3,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_100 = $.text('Three');

							$.append($$anchor, text_100);
						},
						$$slots: { default: true }
					});

					var node_127 = $.sibling(node_126, 2);

					ToggleOption(node_127, {
						value: 4,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_101 = $.text('Four');

							$.append($$anchor, text_101);
						},
						$$slots: { default: true }
					});

					var node_128 = $.sibling(node_127, 2);

					ToggleOption(node_128, {
						value: 5,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_102 = $.text('Five');

							$.append($$anchor, text_102);
						},
						$$slots: { default: true }
					});

					var node_129 = $.sibling(node_128, 2);

					ToggleOption(node_129, {
						value: 6,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_103 = $.text('Six');

							$.append($$anchor, text_103);
						},
						$$slots: { default: true }
					});

					var node_130 = $.sibling(node_129, 2);

					ToggleOption(node_130, {
						value: 7,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_104 = $.text('Seven');

							$.append($$anchor, text_104);
						},
						$$slots: { default: true }
					});

					var node_131 = $.sibling(node_130, 2);

					ToggleOption(node_131, {
						value: 8,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_105 = $.text('Eight');

							$.append($$anchor, text_105);
						},
						$$slots: { default: true }
					});

					var node_132 = $.sibling(node_131, 2);

					ToggleOption(node_132, {
						value: 9,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_106 = $.text('Nine');

							$.append($$anchor, text_106);
						},
						$$slots: { default: true }
					});

					var node_133 = $.sibling(node_132, 2);

					ToggleOption(node_133, {
						value: 10,
						class: 'w-32',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_107 = $.text('Ten');

							$.append($$anchor, text_107);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_37);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var div_9 = $.sibling(node_123, 2);
	var node_134 = $.sibling($.child(div_9));

	Button(node_134, {
		$$events: { click: () => selected = 1 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_108 = $.text('1');

			$.append($$anchor, text_108);
		},
		$$slots: { default: true }
	});

	var node_135 = $.sibling(node_134, 2);

	Button(node_135, {
		$$events: { click: () => selected = 2 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_109 = $.text('2');

			$.append($$anchor, text_109);
		},
		$$slots: { default: true }
	});

	var node_136 = $.sibling(node_135, 2);

	Button(node_136, {
		$$events: { click: () => selected = 3 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_110 = $.text('3');

			$.append($$anchor, text_110);
		},
		$$slots: { default: true }
	});

	var node_137 = $.sibling(node_136, 2);

	Button(node_137, {
		$$events: { click: () => selected = 4 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_111 = $.text('4');

			$.append($$anchor, text_111);
		},
		$$slots: { default: true }
	});

	var node_138 = $.sibling(node_137, 2);

	Button(node_138, {
		$$events: { click: () => selected = 5 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_112 = $.text('5');

			$.append($$anchor, text_112);
		},
		$$slots: { default: true }
	});

	var node_139 = $.sibling(node_138, 2);

	Button(node_139, {
		$$events: { click: () => selected = 6 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_113 = $.text('6');

			$.append($$anchor, text_113);
		},
		$$slots: { default: true }
	});

	var node_140 = $.sibling(node_139, 2);

	Button(node_140, {
		$$events: { click: () => selected = 7 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_114 = $.text('7');

			$.append($$anchor, text_114);
		},
		$$slots: { default: true }
	});

	var node_141 = $.sibling(node_140, 2);

	Button(node_141, {
		$$events: { click: () => selected = 8 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_115 = $.text('8');

			$.append($$anchor, text_115);
		},
		$$slots: { default: true }
	});

	var node_142 = $.sibling(node_141, 2);

	Button(node_142, {
		$$events: { click: () => selected = 9 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_116 = $.text('9');

			$.append($$anchor, text_116);
		},
		$$slots: { default: true }
	});

	var node_143 = $.sibling(node_142, 2);

	Button(node_143, {
		$$events: { click: () => selected = 10 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_117 = $.text('10');

			$.append($$anchor, text_117);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);

	var node_144 = $.sibling(div_9, 4);

	ApiDocs(node_144, {
		get api() {
			return toggleGroupApi;
		}
	});

	var node_145 = $.sibling(node_144, 4);

	ApiDocs(node_145, {
		get api() {
			return toggleOptionApi;
		}
	});

	$.append($$anchor, fragment);
}