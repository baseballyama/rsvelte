import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="border w-[150px] overflow-auto p-1"></div>`);
var root_2 = $.from_html(`<div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div>`, 1);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>Controlled via checked prop</h2> <!> <h2>Controlled via bind:group and value</h2> <!> <h2>Label</h2> <!> <h2>Full width</h2> <!> <h2>Long labels</h2> <!> <h2>Long labels (truncate)</h2> <!> <h2>Disabled</h2> <!> <h2>Size</h2> <!>`, 1);

export default function _page($$anchor) {
	const binding_group = [];
	let group = undefined;
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Radio(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Radio(node_2, { checked: true });

			var node_3 = $.sibling(node_2, 2);

			Radio(node_3, { checked: false });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			Radio(node_5, {
				name: 'group-value',
				value: 1,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Radio(node_6, {
				name: 'group-value',
				value: 2,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Radio(node_7, {
				name: 'group-value',
				value: 3,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				}
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_9 = $.first_child(fragment_3);

			Radio(node_9, {
				name: 'label',
				value: 1,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('First');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Radio(node_10, {
				name: 'label',
				value: 2,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Second');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Radio(node_11, {
				name: 'label',
				value: 3,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Third');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_8, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_13 = $.first_child(fragment_4);

			Radio(node_13, {
				name: 'label',
				value: 1,
				fullWidth: true,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('First');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Radio(node_14, {
				name: 'label',
				value: 2,
				fullWidth: true,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Second');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			Radio(node_15, {
				name: 'label',
				value: 3,
				fullWidth: true,
				get group() {
					return group;
				},

				set group($$value) {
					group = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Third');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_12, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			var div = root_1();

			$.each(div, 20, () => ({ length: 5 }), $.index, ($$anchor, _, i) => {
				Radio($$anchor, {
					name: 'long-label',
					value: i,
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						text_6.nodeValue = `This is a really long label ${i}`;
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 4);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();

			$.each(div_1, 20, () => ({ length: 5 }), $.index, ($$anchor, _, i) => {
				Radio($$anchor, {
					name: 'long-label-truncate',
					value: i,
					classes: { root: 'truncate max-w-full', label: 'truncate' },
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						text_7.nodeValue = `This is a really long label ${i}`;
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_19 = $.first_child(fragment_9);

			Radio(node_19, { disabled: true });

			var node_20 = $.sibling(node_19, 2);

			Radio(node_20, { disabled: true, checked: true });

			var node_21 = $.sibling(node_20, 2);

			Radio(node_21, {
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Label');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_18, 4);

	Preview(node_22, {
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_2();
			var div_2 = $.first_child(fragment_10);
			var node_23 = $.child(div_2);

			Radio(node_23, { name: 'xs', size: 'xs' });

			var node_24 = $.sibling(node_23, 2);

			Radio(node_24, { name: 'xs', size: 'xs', checked: true });

			var node_25 = $.sibling(node_24, 2);

			Radio(node_25, {
				name: 'xs',
				size: 'xs',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Label');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_25, 2);

			Radio(node_26, {
				name: 'xs',
				size: 'xs',
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Label');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_27 = $.child(div_3);

			Radio(node_27, { name: 'sm', size: 'sm' });

			var node_28 = $.sibling(node_27, 2);

			Radio(node_28, { name: 'sm', size: 'sm', checked: true });

			var node_29 = $.sibling(node_28, 2);

			Radio(node_29, {
				name: 'sm',
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Label');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			var node_30 = $.sibling(node_29, 2);

			Radio(node_30, {
				name: 'sm',
				size: 'sm',
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Label');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_31 = $.child(div_4);

			Radio(node_31, { name: 'md', size: 'md' });

			var node_32 = $.sibling(node_31, 2);

			Radio(node_32, { name: 'md', size: 'md', checked: true });

			var node_33 = $.sibling(node_32, 2);

			Radio(node_33, {
				name: 'md',
				size: 'md',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Label');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_34 = $.sibling(node_33, 2);

			Radio(node_34, {
				name: 'md',
				size: 'md',
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Label');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_35 = $.child(div_5);

			Radio(node_35, { name: 'lg', size: 'lg' });

			var node_36 = $.sibling(node_35, 2);

			Radio(node_36, { name: 'lg', size: 'lg', checked: true });

			var node_37 = $.sibling(node_36, 2);

			Radio(node_37, {
				name: 'lg',
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Label');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_38 = $.sibling(node_37, 2);

			Radio(node_38, {
				name: 'lg',
				size: 'lg',
				checked: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('Label');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}