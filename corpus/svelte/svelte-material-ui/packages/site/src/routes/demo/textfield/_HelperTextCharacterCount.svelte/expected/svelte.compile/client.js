import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text';
import CharacterCounter from '@smui/textfield/character-counter';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _HelperTextCharacterCount($$anchor) {
	let valueA = $.state('');
	let valueB = $.state('');
	let valueC = $.state('');
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		const helper = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			HelperText(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Helper Text');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			CharacterCounter(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('0 / 18');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		};

		Textfield(node, {
			label: 'Standard',
			input$maxlength: 18,
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
	var text_2 = $.only_child(pre);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.child(div_2);

	{
		const helper = ($$anchor) => {
			var fragment_1 = root();
			var node_4 = $.first_child(fragment_1);

			HelperText(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Helper Text');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			CharacterCounter(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('0 / 18');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Textfield(node_3, {
			variant: 'filled',
			label: 'Filled',
			input$maxlength: 18,
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

	var pre_1 = $.sibling(node_3, 2);
	var text_5 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	{
		const helper = ($$anchor) => {
			var fragment_2 = root();
			var node_7 = $.first_child(fragment_2);

			HelperText(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Helper Text');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			CharacterCounter(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('0 / 18');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		};

		Textfield(node_6, {
			variant: 'outlined',
			label: 'Outlined',
			input$maxlength: 18,
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

	var pre_2 = $.sibling(node_6, 2);
	var text_8 = $.only_child(pre_2);

	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_2, `Value: ${$.get(valueA) ?? ''}`);
		$.set_text(text_5, `Value: ${$.get(valueB) ?? ''}`);
		$.set_text(text_8, `Value: ${$.get(valueC) ?? ''}`);
	});

	$.append($$anchor, div);
}