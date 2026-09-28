import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Checkbox, SectionDivider } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="text-sm">set: <!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <div> </div> <div class="text-sm"><!> <!></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="border w-[150px] overflow-auto p-1"></div>`);
var root_5 = $.from_html(`<div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>bind:checked</h2> <!> <h2>bind:group</h2> <!> <h2>Label</h2> <!> <h2>Full width</h2> <!> <h2>Long labels</h2> <!> <h2>Long labels (truncate)</h2> <!> <h2>Disabled</h2> <!> <h2>Indeterminate</h2> <!> <h2>Size</h2> <!> <!> <h2>Default</h2> <!> <h2>Label</h2> <!> <h2>Disabled</h2> <!> <h2>Indeterminate</h2> <!> <h2>Size</h2> <!>`, 1);

export default function _page($$anchor) {
	const binding_group = [];
	let checked = true;
	let group = [2];
	var fragment = root_7();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Checkbox(node_2, { checked: true });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_4 = $.first_child(fragment_2);

			Checkbox(node_4, {
				get checked() {
					return checked;
				},

				set checked($$value) {
					checked = $$value;
				}
			});

			var div = $.sibling(node_4, 2);
			var node_5 = $.sibling($.child(div));

			Button(node_5, {
				size: 'sm',
				$$events: { click: () => checked = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('true');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				size: 'sm',
				$$events: { click: () => checked = false },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('false');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_3, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_8 = $.first_child(fragment_3);

			Checkbox(node_8, {
				value: 1,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('One');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Checkbox(node_9, {
				value: 2,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Two');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Checkbox(node_10, {
				value: 3,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Three');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Checkbox(node_11, {
				value: 4,
				disabled: true,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Four (disabled)');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_11, 2);
			var text_6 = $.only_child(div_1, true);
			var div_2 = $.sibling(div_1, 2);
			var node_12 = $.child(div_2);

			Button(node_12, {
				size: 'sm',
				$$events: { click: () => group = [] },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('clear');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Button(node_13, {
				size: 'sm',
				$$events: { click: () => group = [1, 2, 3, 4] },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('select all');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.template_effect(($0) => $.set_text(text_6, $0), [() => JSON.stringify(group)]);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_7, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_15 = $.first_child(fragment_4);

			Checkbox(node_15, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Label');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			Checkbox(node_16, {
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Label');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_14, 4);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_18 = $.first_child(fragment_5);

			Checkbox(node_18, {
				fullWidth: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('One');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			Checkbox(node_19, {
				fullWidth: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Two');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_19, 2);

			Checkbox(node_20, {
				fullWidth: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Three');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			Checkbox(node_21, {
				fullWidth: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Four (disabled)');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_17, 4);

	Preview(node_22, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_4();

			$.each(div_3, 20, () => ({ length: 5 }), $.index, ($$anchor, _) => {
				Checkbox($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_15 = $.text('This is a really long label');

						$.append($$anchor, text_15);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_22, 4);

	Preview(node_23, {
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_4();

			$.each(div_4, 20, () => ({ length: 5 }), $.index, ($$anchor, _) => {
				Checkbox($$anchor, {
					classes: { root: 'truncate max-w-full', label: 'truncate' },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_16 = $.text('This is a really long label');

						$.append($$anchor, text_16);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_23, 4);

	Preview(node_24, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_3();
			var node_25 = $.first_child(fragment_8);

			Checkbox(node_25, { disabled: true });

			var node_26 = $.sibling(node_25, 2);

			Checkbox(node_26, { disabled: true, checked: true });

			var node_27 = $.sibling(node_26, 2);

			Checkbox(node_27, {
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('Label');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			var node_28 = $.sibling(node_27, 2);

			Checkbox(node_28, {
				disabled: true,
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_18 = $.text('Label');

					$.append($$anchor, text_18);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_29 = $.sibling(node_24, 4);

	Preview(node_29, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_30 = $.first_child(fragment_9);

			Checkbox(node_30, { indeterminate: true });

			var node_31 = $.sibling(node_30, 2);

			Checkbox(node_31, { indeterminate: true, checked: true });
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node_29, 4);

	Preview(node_32, {
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_5();
			var div_5 = $.first_child(fragment_10);
			var node_33 = $.child(div_5);

			Checkbox(node_33, { size: 'xs' });

			var node_34 = $.sibling(node_33, 2);

			Checkbox(node_34, { size: 'xs', checked: true });

			var node_35 = $.sibling(node_34, 2);

			Checkbox(node_35, {
				size: 'xs',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('Label');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			var node_36 = $.sibling(node_35, 2);

			Checkbox(node_36, {
				size: 'xs',
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('Label');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var node_37 = $.child(div_6);

			Checkbox(node_37, { size: 'sm' });

			var node_38 = $.sibling(node_37, 2);

			Checkbox(node_38, { size: 'sm', checked: true });

			var node_39 = $.sibling(node_38, 2);

			Checkbox(node_39, {
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('Label');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			var node_40 = $.sibling(node_39, 2);

			Checkbox(node_40, {
				size: 'sm',
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('Label');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var node_41 = $.child(div_7);

			Checkbox(node_41, { size: 'md' });

			var node_42 = $.sibling(node_41, 2);

			Checkbox(node_42, { size: 'md', checked: true });

			var node_43 = $.sibling(node_42, 2);

			Checkbox(node_43, {
				size: 'md',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('Label');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			var node_44 = $.sibling(node_43, 2);

			Checkbox(node_44, {
				size: 'md',
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_24 = $.text('Label');

					$.append($$anchor, text_24);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);

			var div_8 = $.sibling(div_7, 2);
			var node_45 = $.child(div_8);

			Checkbox(node_45, { size: 'lg' });

			var node_46 = $.sibling(node_45, 2);

			Checkbox(node_46, { size: 'lg', checked: true });

			var node_47 = $.sibling(node_46, 2);

			Checkbox(node_47, {
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_25 = $.text('Label');

					$.append($$anchor, text_25);
				},
				$$slots: { default: true }
			});

			var node_48 = $.sibling(node_47, 2);

			Checkbox(node_48, {
				size: 'lg',
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_26 = $.text('Label');

					$.append($$anchor, text_26);
				},
				$$slots: { default: true }
			});

			$.reset(div_8);
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_49 = $.sibling(node_32, 2);

	SectionDivider(node_49, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_27 = $.text('Circle');

			$.append($$anchor, text_27);
		},
		$$slots: { default: true }
	});

	var node_50 = $.sibling(node_49, 4);

	Preview(node_50, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_6();
			var node_51 = $.first_child(fragment_11);

			Checkbox(node_51, { circle: true });

			var node_52 = $.sibling(node_51, 2);

			Checkbox(node_52, { circle: true, checked: true });

			var node_53 = $.sibling(node_52, 2);

			Checkbox(node_53, { circle: true });
			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_54 = $.sibling(node_50, 4);

	Preview(node_54, {
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_6();
			var node_55 = $.first_child(fragment_12);

			Checkbox(node_55, {
				circle: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_28 = $.text('First');

					$.append($$anchor, text_28);
				},
				$$slots: { default: true }
			});

			var node_56 = $.sibling(node_55, 2);

			Checkbox(node_56, {
				circle: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_29 = $.text('Second');

					$.append($$anchor, text_29);
				},
				$$slots: { default: true }
			});

			var node_57 = $.sibling(node_56, 2);

			Checkbox(node_57, {
				circle: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_30 = $.text('Third');

					$.append($$anchor, text_30);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var node_58 = $.sibling(node_54, 4);

	Preview(node_58, {
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root();
			var node_59 = $.first_child(fragment_13);

			Checkbox(node_59, { circle: true, disabled: true });

			var node_60 = $.sibling(node_59, 2);

			Checkbox(node_60, { circle: true, disabled: true, checked: true });
			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_61 = $.sibling(node_58, 4);

	Preview(node_61, {
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root();
			var node_62 = $.first_child(fragment_14);

			Checkbox(node_62, { circle: true, indeterminate: true });

			var node_63 = $.sibling(node_62, 2);

			Checkbox(node_63, { circle: true, indeterminate: true, checked: true });
			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	var node_64 = $.sibling(node_61, 4);

	Preview(node_64, {
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root_5();
			var div_9 = $.first_child(fragment_15);
			var node_65 = $.child(div_9);

			Checkbox(node_65, { size: 'xs', circle: true });

			var node_66 = $.sibling(node_65, 2);

			Checkbox(node_66, { size: 'xs', circle: true, checked: true });

			var node_67 = $.sibling(node_66, 2);

			Checkbox(node_67, {
				size: 'xs',
				circle: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_31 = $.text('Label');

					$.append($$anchor, text_31);
				},
				$$slots: { default: true }
			});

			var node_68 = $.sibling(node_67, 2);

			Checkbox(node_68, {
				size: 'xs',
				circle: true,
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_32 = $.text('Label');

					$.append($$anchor, text_32);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);

			var div_10 = $.sibling(div_9, 2);
			var node_69 = $.child(div_10);

			Checkbox(node_69, { size: 'sm', circle: true });

			var node_70 = $.sibling(node_69, 2);

			Checkbox(node_70, { size: 'sm', circle: true, checked: true });

			var node_71 = $.sibling(node_70, 2);

			Checkbox(node_71, {
				size: 'sm',
				circle: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_33 = $.text('Label');

					$.append($$anchor, text_33);
				},
				$$slots: { default: true }
			});

			var node_72 = $.sibling(node_71, 2);

			Checkbox(node_72, {
				size: 'sm',
				circle: true,
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_34 = $.text('Label');

					$.append($$anchor, text_34);
				},
				$$slots: { default: true }
			});

			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var node_73 = $.child(div_11);

			Checkbox(node_73, { size: 'md', circle: true });

			var node_74 = $.sibling(node_73, 2);

			Checkbox(node_74, { size: 'md', circle: true, checked: true });

			var node_75 = $.sibling(node_74, 2);

			Checkbox(node_75, {
				size: 'md',
				circle: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_35 = $.text('Label');

					$.append($$anchor, text_35);
				},
				$$slots: { default: true }
			});

			var node_76 = $.sibling(node_75, 2);

			Checkbox(node_76, {
				size: 'md',
				circle: true,
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_36 = $.text('Label');

					$.append($$anchor, text_36);
				},
				$$slots: { default: true }
			});

			$.reset(div_11);

			var div_12 = $.sibling(div_11, 2);
			var node_77 = $.child(div_12);

			Checkbox(node_77, { size: 'lg', circle: true });

			var node_78 = $.sibling(node_77, 2);

			Checkbox(node_78, { size: 'lg', circle: true, checked: true });

			var node_79 = $.sibling(node_78, 2);

			Checkbox(node_79, {
				size: 'lg',
				circle: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_37 = $.text('Label');

					$.append($$anchor, text_37);
				},
				$$slots: { default: true }
			});

			var node_80 = $.sibling(node_79, 2);

			Checkbox(node_80, {
				size: 'lg',
				circle: true,
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_38 = $.text('Label');

					$.append($$anchor, text_38);
				},
				$$slots: { default: true }
			});

			$.reset(div_12);
			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}