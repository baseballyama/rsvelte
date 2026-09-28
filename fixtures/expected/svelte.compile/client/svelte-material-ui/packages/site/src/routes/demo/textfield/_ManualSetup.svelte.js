import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield, { Input, Textarea } from '@smui/textfield';
import Icon from '@smui/textfield/icon';
import HelperText from '@smui/textfield/helper-text';
import FloatingLabel from '@smui/floating-label';
import LineRipple from '@smui/line-ripple';
import NotchedOutline from '@smui/notched-outline';

var root = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _ManualSetup($$anchor) {
	// Manual Setup requires passing the lower components up to the Textfield
	let valueA = $.state('');

	let inputA = $.state(void 0);
	let floatingLabelA = $.state(void 0);
	let lineRippleA = $.state(void 0);
	let valueB = $.state('');
	let inputB = $.state(void 0);
	let floatingLabelB = $.state(void 0);
	let lineRippleB = $.state(void 0);
	let valueC = $.state('');
	let inputC = $.state(void 0);
	let notchedOutlineC = $.state(void 0);
	let floatingLabelC = $.state(void 0);
	let valueD = $.state('');
	let inputD = $.state(void 0);
	let notchedOutlineD = $.state(void 0);
	let floatingLabelD = $.state(void 0);
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		const label = ($$anchor) => {
			$.bind_this(
				FloatingLabel($$anchor, {
					for: 'input-manual-a',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Standard');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				}),
				($$value) => $.set(floatingLabelA, $$value, true),
				() => $.get(floatingLabelA)
			);
		};

		const line = ($$anchor) => {
			$.bind_this(LineRipple($$anchor, {}), ($$value) => $.set(lineRippleA, $$value, true), () => $.get(lineRippleA));
		};

		const helper = ($$anchor) => {
			HelperText($$anchor, {
				id: 'helper-text-manual-a',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Helper Text');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node, {
			get input() {
				return $.get(inputA);
			},

			get floatingLabel() {
				return $.get(floatingLabelA);
			},

			get lineRipple() {
				return $.get(lineRippleA);
			},
			label,
			line,
			helper,
			children: ($$anchor, $$slotProps) => {
				$.bind_this(
					Input($$anchor, {
						id: 'input-manual-a',
						'aria-controls': 'helper-text-manual-a',
						'aria-describedby': 'helper-text-manual-a',
						get value() {
							return $.get(valueA);
						},

						set value($$value) {
							$.set(valueA, $$value, true);
						}
					}),
					($$value) => $.set(inputA, $$value, true),
					() => $.get(inputA)
				);
			},
			$$slots: { label: true, line: true, helper: true, default: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text_2 = $.only_child(pre);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		const label = ($$anchor) => {
			$.bind_this(
				FloatingLabel($$anchor, {
					for: 'input-manual-b',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Filled');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				}),
				($$value) => $.set(floatingLabelB, $$value, true),
				() => $.get(floatingLabelB)
			);
		};

		const line = ($$anchor) => {
			$.bind_this(LineRipple($$anchor, {}), ($$value) => $.set(lineRippleB, $$value, true), () => $.get(lineRippleB));
		};

		const helper = ($$anchor) => {
			HelperText($$anchor, {
				id: 'helper-text-manual-b',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Helper Text');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_1, {
			get input() {
				return $.get(inputB);
			},

			get floatingLabel() {
				return $.get(floatingLabelB);
			},

			get lineRipple() {
				return $.get(lineRippleB);
			},
			variant: 'filled',
			label,
			line,
			helper,
			children: ($$anchor, $$slotProps) => {
				$.bind_this(
					Input($$anchor, {
						id: 'input-manual-b',
						'aria-controls': 'helper-text-manual-b',
						'aria-describedby': 'helper-text-manual-b',
						get value() {
							return $.get(valueB);
						},

						set value($$value) {
							$.set(valueB, $$value, true);
						}
					}),
					($$value) => $.set(inputB, $$value, true),
					() => $.get(inputB)
				);
			},
			$$slots: { label: true, line: true, helper: true, default: true }
		});
	}

	var pre_1 = $.sibling(node_1, 2);
	var text_5 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	{
		const label = ($$anchor) => {
			$.bind_this(
				NotchedOutline($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.bind_this(
							FloatingLabel($$anchor, {
								for: 'input-manual-c',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Outlined');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							}),
							($$value) => $.set(floatingLabelC, $$value, true),
							() => $.get(floatingLabelC)
						);
					},
					$$slots: { default: true }
				}),
				($$value) => $.set(notchedOutlineC, $$value, true),
				() => $.get(notchedOutlineC)
			);
		};

		const leadingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('event');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});
		};

		const helper = ($$anchor) => {
			HelperText($$anchor, {
				id: 'helper-text-manual-c',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Helper Text');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_2, {
			get input() {
				return $.get(inputC);
			},

			get notchedOutline() {
				return $.get(notchedOutlineC);
			},

			get floatingLabel() {
				return $.get(floatingLabelC);
			},
			variant: 'outlined',
			label,
			leadingIcon,
			helper,
			children: ($$anchor, $$slotProps) => {
				$.bind_this(
					Input($$anchor, {
						id: 'input-manual-c',
						'aria-controls': 'helper-text-manual-c',
						'aria-describedby': 'helper-text-manual-c',
						get value() {
							return $.get(valueC);
						},

						set value($$value) {
							$.set(valueC, $$value, true);
						}
					}),
					($$value) => $.set(inputC, $$value, true),
					() => $.get(inputC)
				);
			},
			$$slots: { label: true, leadingIcon: true, helper: true, default: true }
		});
	}

	var pre_2 = $.sibling(node_2, 2);
	var text_9 = $.only_child(pre_2);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.child(div_4);

	{
		const label = ($$anchor) => {
			$.bind_this(
				NotchedOutline($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.bind_this(
							FloatingLabel($$anchor, {
								for: 'input-manual-d',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Textarea');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							}),
							($$value) => $.set(floatingLabelD, $$value, true),
							() => $.get(floatingLabelD)
						);
					},
					$$slots: { default: true }
				}),
				($$value) => $.set(notchedOutlineD, $$value, true),
				() => $.get(notchedOutlineD)
			);
		};

		const helper = ($$anchor) => {
			HelperText($$anchor, {
				id: 'helper-text-manual-d',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Helper Text');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_3, {
			get input() {
				return $.get(inputD);
			},

			get notchedOutline() {
				return $.get(notchedOutlineD);
			},

			get floatingLabel() {
				return $.get(floatingLabelD);
			},
			textarea: true,
			label,
			helper,
			children: ($$anchor, $$slotProps) => {
				$.bind_this(
					Textarea($$anchor, {
						id: 'input-manual-d',
						'aria-controls': 'helper-text-manual-d',
						'aria-describedby': 'helper-text-manual-d',
						get value() {
							return $.get(valueD);
						},

						set value($$value) {
							$.set(valueD, $$value, true);
						}
					}),
					($$value) => $.set(inputD, $$value, true),
					() => $.get(inputD)
				);
			},
			$$slots: { label: true, helper: true, default: true }
		});
	}

	var pre_3 = $.sibling(node_3, 2);
	var text_12 = $.only_child(pre_3);

	$.reset(div_4);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_2, `Value: ${$.get(valueA) ?? ''}`);
		$.set_text(text_5, `Value: ${$.get(valueB) ?? ''}`);
		$.set_text(text_9, `Value: ${$.get(valueC) ?? ''}`);
		$.set_text(text_12, `Value: ${$.get(valueD) ?? ''}`);
	});

	$.append($$anchor, div);
}