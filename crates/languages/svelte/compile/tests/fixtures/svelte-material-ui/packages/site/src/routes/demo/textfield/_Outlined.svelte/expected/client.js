import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import Icon from '@smui/textfield/icon';
import HelperText from '@smui/textfield/helper-text';

var root = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _Outlined($$anchor) {
	let valueA = $.state('');
	let valueB = $.state('');
	let valueC = $.state('');
	let valueD = $.state('');
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		const helper = ($$anchor) => {
			HelperText($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Helper Text');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node, {
			variant: 'outlined',
			label: 'Label',
			get value() {
				return $.get(valueA);
			},

			set value($$value) {
				$.set(valueA, $$value, true);
			},
			helper,
			$$slots: { helper: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text_1 = $.only_child(pre);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		const leadingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('event');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		};

		const helper = ($$anchor) => {
			HelperText($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Helper Text');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_1, {
			variant: 'outlined',
			label: 'Leading Icon',
			get value() {
				return $.get(valueB);
			},

			set value($$value) {
				$.set(valueB, $$value, true);
			},
			leadingIcon,
			helper,
			$$slots: { leadingIcon: true, helper: true }
		});
	}

	var pre_1 = $.sibling(node_1, 2);
	var text_4 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	{
		const trailingIcon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('delete');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		};

		const helper = ($$anchor) => {
			HelperText($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Helper Text');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_2, {
			variant: 'outlined',
			label: 'Trailing Icon',
			get value() {
				return $.get(valueC);
			},

			set value($$value) {
				$.set(valueC, $$value, true);
			},
			trailingIcon,
			helper,
			$$slots: { trailingIcon: true, helper: true }
		});
	}

	var pre_2 = $.sibling(node_2, 2);
	var text_7 = $.only_child(pre_2);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.child(div_4);

	{
		const helper = ($$anchor) => {
			HelperText($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Helper Text');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_3, {
			variant: 'outlined',
			invalid: true,
			label: 'Invalid',
			get value() {
				return $.get(valueD);
			},

			set value($$value) {
				$.set(valueD, $$value, true);
			},
			helper,
			$$slots: { helper: true }
		});
	}

	var pre_3 = $.sibling(node_3, 2);
	var text_9 = $.only_child(pre_3);

	$.reset(div_4);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, `Value: ${$.get(valueA) ?? ''}`);
		$.set_text(text_4, `Value: ${$.get(valueB) ?? ''}`);
		$.set_text(text_7, `Value: ${$.get(valueC) ?? ''}`);
		$.set_text(text_9, `Value: ${$.get(valueD) ?? ''}`);
	});

	$.append($$anchor, div);
}