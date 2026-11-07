import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ProgressCircle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<span class="text-surface-content/50 text-xs"><!></span>`);
var root_1 = $.from_html(`<div class="flex gap-4"><!> <!> <!> <!> <!> <!></div>`);
var root_2 = $.from_html(`<span class="text-surface-content/50 text-xs">0%</span>`);
var root_3 = $.from_html(`<span class="text-surface-content/50 text-xs">20%</span>`);
var root_4 = $.from_html(`<span class="text-surface-content/50 text-xs">40%</span>`);
var root_5 = $.from_html(`<span class="text-surface-content/50 text-xs">60%</span>`);
var root_6 = $.from_html(`<span class="text-surface-content/50 text-xs">80%</span>`);
var root_7 = $.from_html(`<span class="text-surface-content/50 text-xs">100%</span>`);
var root_8 = $.from_html(`<div class="flex gap-4"><!> <!> <!></div>`);
var root_9 = $.from_html(`<div class="flex gap-4"><!> <!> <!> <!></div>`);
var root_10 = $.from_html(`<div class="flex gap-4"><!> <!> <!> <!> <!></div>`);
var root_11 = $.from_html(`<h1>Examples</h1> <h2>Demo</h2> <div class="border rounded bg-surface-100"><div class="grid grid-cols-[1fr,auto] items-center justify-items-center gap-4"><!> <div class="bg-surface-content/5 border-l p-4"><label class="block">size: <input type="range"/></label> <label class="block">width: <input type="range"/></label> <label class="block">rotate: <input type="range"/></label> <label class="block">value: <input type="range"/></label> <label class="block">indeterminate: <input type="checkbox"/></label> <label class="block">track: <input type="checkbox"/></label> <label class="block">label: <input type="checkbox"/></label></div></div></div> <h2>Default</h2> <!> <h2>Value</h2> <!> <h2>Value w/ with track</h2> <!> <h2>Value w/ with label</h2> <!> <h2>Value w/ with label and track</h2> <!> <h2>Size</h2> <!> <h2>Width</h2> <!> <h2>Color</h2> <!> <h2>Track Color</h2> <!>`, 1);

export default function _page($$anchor) {
	let value = 50;
	let size = 40;
	let width = 4;
	let rotate = 0;
	let track = false;
	let indeterminate = true;
	let label = false;
	var fragment = root_11();
	var div = $.sibling($.first_child(fragment), 4);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => indeterminate ? null : value);

		ProgressCircle(node, {
			get value() {
				return $.get($0);
			},

			get size() {
				return size;
			},

			get width() {
				return width;
			},

			get rotate() {
				return rotate;
			},

			get track() {
				return track;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						var span = root();
						var node_2 = $.child(span);

						{
							var consequent = ($$anchor) => {
								var text = $.text('Loading...');

								$.append($$anchor, text);
							};

							var alternate = ($$anchor) => {
								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, `${value ?? ''}%`));
								$.append($$anchor, text_1);
							};

							$.if(node_2, ($$render) => {
								if (indeterminate) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.reset(span);
						$.append($$anchor, span);
					};

					$.if(node_1, ($$render) => {
						if (label) $$render(consequent_1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	var div_2 = $.sibling(node, 2);
	var label_1 = $.child(div_2);
	var input = $.sibling($.child(label_1));

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 0);
	$.set_attribute(input, 'max', 120);
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_1 = $.sibling($.child(label_2));

	$.remove_input_defaults(input_1);
	$.set_attribute(input_1, 'min', 0);
	$.set_attribute(input_1, 'max', 20);
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_2 = $.sibling($.child(label_3));

	$.remove_input_defaults(input_2);
	$.set_attribute(input_2, 'min', 0);
	$.set_attribute(input_2, 'max', 360);
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var input_3 = $.sibling($.child(label_4));

	$.remove_input_defaults(input_3);
	$.set_attribute(input_3, 'min', 0);
	$.set_attribute(input_3, 'max', 100);
	$.reset(label_4);

	var label_5 = $.sibling(label_4, 2);
	var input_4 = $.sibling($.child(label_5));

	$.remove_input_defaults(input_4);
	$.reset(label_5);

	var label_6 = $.sibling(label_5, 2);
	var input_5 = $.sibling($.child(label_6));

	$.remove_input_defaults(input_5);
	$.reset(label_6);

	var label_7 = $.sibling(label_6, 2);
	var input_6 = $.sibling($.child(label_7));

	$.remove_input_defaults(input_6);
	$.reset(label_7);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	var node_3 = $.sibling(div, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			ProgressCircle($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_1();
			var node_5 = $.child(div_3);

			ProgressCircle(node_5, { value: 0 });

			var node_6 = $.sibling(node_5, 2);

			ProgressCircle(node_6, { value: 20 });

			var node_7 = $.sibling(node_6, 2);

			ProgressCircle(node_7, { value: 40 });

			var node_8 = $.sibling(node_7, 2);

			ProgressCircle(node_8, { value: 60 });

			var node_9 = $.sibling(node_8, 2);

			ProgressCircle(node_9, { value: 80 });

			var node_10 = $.sibling(node_9, 2);

			ProgressCircle(node_10, { value: 100 });
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_4, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_1();
			var node_12 = $.child(div_4);

			ProgressCircle(node_12, { value: 0, track: true });

			var node_13 = $.sibling(node_12, 2);

			ProgressCircle(node_13, { value: 20, track: true });

			var node_14 = $.sibling(node_13, 2);

			ProgressCircle(node_14, { value: 40, track: true });

			var node_15 = $.sibling(node_14, 2);

			ProgressCircle(node_15, { value: 60, track: true });

			var node_16 = $.sibling(node_15, 2);

			ProgressCircle(node_16, { value: 80, track: true });

			var node_17 = $.sibling(node_16, 2);

			ProgressCircle(node_17, { value: 100, track: true });
			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_11, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_1();
			var node_19 = $.child(div_5);

			ProgressCircle(node_19, {
				value: 0,
				children: ($$anchor, $$slotProps) => {
					var span_1 = root_2();

					$.append($$anchor, span_1);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_19, 2);

			ProgressCircle(node_20, {
				value: 20,
				children: ($$anchor, $$slotProps) => {
					var span_2 = root_3();

					$.append($$anchor, span_2);
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			ProgressCircle(node_21, {
				value: 40,
				children: ($$anchor, $$slotProps) => {
					var span_3 = root_4();

					$.append($$anchor, span_3);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			ProgressCircle(node_22, {
				value: 60,
				children: ($$anchor, $$slotProps) => {
					var span_4 = root_5();

					$.append($$anchor, span_4);
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			ProgressCircle(node_23, {
				value: 80,
				children: ($$anchor, $$slotProps) => {
					var span_5 = root_6();

					$.append($$anchor, span_5);
				},
				$$slots: { default: true }
			});

			var node_24 = $.sibling(node_23, 2);

			ProgressCircle(node_24, {
				value: 100,
				children: ($$anchor, $$slotProps) => {
					var span_6 = root_7();

					$.append($$anchor, span_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_18, 4);

	Preview(node_25, {
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_1();
			var node_26 = $.child(div_6);

			ProgressCircle(node_26, {
				value: 0,
				track: true,
				children: ($$anchor, $$slotProps) => {
					var span_7 = root_2();

					$.append($$anchor, span_7);
				},
				$$slots: { default: true }
			});

			var node_27 = $.sibling(node_26, 2);

			ProgressCircle(node_27, {
				value: 20,
				track: true,
				children: ($$anchor, $$slotProps) => {
					var span_8 = root_3();

					$.append($$anchor, span_8);
				},
				$$slots: { default: true }
			});

			var node_28 = $.sibling(node_27, 2);

			ProgressCircle(node_28, {
				value: 40,
				track: true,
				children: ($$anchor, $$slotProps) => {
					var span_9 = root_4();

					$.append($$anchor, span_9);
				},
				$$slots: { default: true }
			});

			var node_29 = $.sibling(node_28, 2);

			ProgressCircle(node_29, {
				value: 60,
				track: true,
				children: ($$anchor, $$slotProps) => {
					var span_10 = root_5();

					$.append($$anchor, span_10);
				},
				$$slots: { default: true }
			});

			var node_30 = $.sibling(node_29, 2);

			ProgressCircle(node_30, {
				value: 80,
				track: true,
				children: ($$anchor, $$slotProps) => {
					var span_11 = root_6();

					$.append($$anchor, span_11);
				},
				$$slots: { default: true }
			});

			var node_31 = $.sibling(node_30, 2);

			ProgressCircle(node_31, {
				value: 100,
				track: true,
				children: ($$anchor, $$slotProps) => {
					var span_12 = root_7();

					$.append($$anchor, span_12);
				},
				$$slots: { default: true }
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node_25, 4);

	Preview(node_32, {
		children: ($$anchor, $$slotProps) => {
			var div_7 = root_8();
			var node_33 = $.child(div_7);

			ProgressCircle(node_33, { size: 20 });

			var node_34 = $.sibling(node_33, 2);

			ProgressCircle(node_34, {});

			var node_35 = $.sibling(node_34, 2);

			ProgressCircle(node_35, { size: 100 });
			$.reset(div_7);
			$.append($$anchor, div_7);
		},
		$$slots: { default: true }
	});

	var node_36 = $.sibling(node_32, 4);

	Preview(node_36, {
		children: ($$anchor, $$slotProps) => {
			var div_8 = root_9();
			var node_37 = $.child(div_8);

			ProgressCircle(node_37, { width: 1 });

			var node_38 = $.sibling(node_37, 2);

			ProgressCircle(node_38, { width: 2 });

			var node_39 = $.sibling(node_38, 2);

			ProgressCircle(node_39, {});

			var node_40 = $.sibling(node_39, 2);

			ProgressCircle(node_40, { width: 10 });
			$.reset(div_8);
			$.append($$anchor, div_8);
		},
		$$slots: { default: true }
	});

	var node_41 = $.sibling(node_36, 4);

	Preview(node_41, {
		children: ($$anchor, $$slotProps) => {
			var div_9 = root_10();
			var node_42 = $.child(div_9);

			ProgressCircle(node_42, { class: 'text-blue-500' });

			var node_43 = $.sibling(node_42, 2);

			ProgressCircle(node_43, { class: 'text-danger' });

			var node_44 = $.sibling(node_43, 2);

			ProgressCircle(node_44, { class: 'text-info' });

			var node_45 = $.sibling(node_44, 2);

			ProgressCircle(node_45, { class: 'text-success' });

			var node_46 = $.sibling(node_45, 2);

			ProgressCircle(node_46, { class: 'text-orange-500' });
			$.reset(div_9);
			$.append($$anchor, div_9);
		},
		$$slots: { default: true }
	});

	var node_47 = $.sibling(node_41, 4);

	Preview(node_47, {
		children: ($$anchor, $$slotProps) => {
			var div_10 = root_10();
			var node_48 = $.child(div_10);

			ProgressCircle(node_48, {
				class: 'text-blue-500 [--track-color:theme(colors.blue.500/10%)]',
				track: true
			});

			var node_49 = $.sibling(node_48, 2);

			ProgressCircle(node_49, {
				class: 'text-danger [--track-color:theme(colors.danger/10%)]',
				track: true
			});

			var node_50 = $.sibling(node_49, 2);

			ProgressCircle(node_50, {
				class: 'text-info [--track-color:theme(colors.info/10%)]',
				track: true
			});

			var node_51 = $.sibling(node_50, 2);

			ProgressCircle(node_51, {
				class: 'text-success [--track-color:theme(colors.success/10%)]',
				track: true
			});

			var node_52 = $.sibling(node_51, 2);

			ProgressCircle(node_52, {
				class: 'text-warning [--track-color:theme(colors.warning/10%)]',
				track: true
			});

			$.reset(div_10);
			$.append($$anchor, div_10);
		},
		$$slots: { default: true }
	});

	$.template_effect(() => input_3.disabled = indeterminate);
	$.bind_value(input, () => size, ($$value) => size = $$value);
	$.bind_value(input_1, () => width, ($$value) => width = $$value);
	$.bind_value(input_2, () => rotate, ($$value) => rotate = $$value);
	$.bind_value(input_3, () => value, ($$value) => value = $$value);
	$.bind_checked(input_4, () => indeterminate, ($$value) => indeterminate = $$value);
	$.bind_checked(input_5, () => track, ($$value) => track = $$value);
	$.bind_checked(input_6, () => label, ($$value) => label = $$value);
	$.append($$anchor, fragment);
}