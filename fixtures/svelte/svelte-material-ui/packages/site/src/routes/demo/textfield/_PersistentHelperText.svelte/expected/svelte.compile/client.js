import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text';

var root = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _PersistentHelperText($$anchor) {
	let valueA = $.state('');
	let valueB = $.state('');
	let valueC = $.state('');
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		const helper = ($$anchor) => {
			HelperText($$anchor, {
				persistent: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Helper Text');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node, {
			label: 'Standard',
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
		const helper = ($$anchor) => {
			HelperText($$anchor, {
				persistent: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Helper Text');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_1, {
			variant: 'filled',
			label: 'Filled',
			get value() {
				return $.get(valueB);
			},

			set value($$value) {
				$.set(valueB, $$value, true);
			},
			helper,
			$$slots: { helper: true }
		});
	}

	var pre_1 = $.sibling(node_1, 2);
	var text_3 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	{
		const helper = ($$anchor) => {
			HelperText($$anchor, {
				persistent: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Helper Text');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_2, {
			variant: 'outlined',
			label: 'Outlined',
			get value() {
				return $.get(valueC);
			},

			set value($$value) {
				$.set(valueC, $$value, true);
			},
			helper,
			$$slots: { helper: true }
		});
	}

	var pre_2 = $.sibling(node_2, 2);
	var text_5 = $.only_child(pre_2);

	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_1, `Value: ${$.get(valueA) ?? ''}`);
		$.set_text(text_3, `Value: ${$.get(valueB) ?? ''}`);
		$.set_text(text_5, `Value: ${$.get(valueC) ?? ''}`);
	});

	$.append($$anchor, div);
}