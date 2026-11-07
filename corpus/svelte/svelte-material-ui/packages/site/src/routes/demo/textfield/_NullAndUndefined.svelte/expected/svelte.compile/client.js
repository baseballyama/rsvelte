import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text';

var root = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _NullAndUndefined($$anchor) {
	let valueNull = $.state(null);
	let valueUndefined = $.state(undefined);
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
			label: 'Empty as Null',
			get value() {
				return $.get(valueNull);
			},

			set value($$value) {
				$.set(valueNull, $$value, true);
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
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Helper Text');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_1, {
			label: 'Empty as Undefined',
			input$emptyValueUndefined: true,
			get value() {
				return $.get(valueUndefined);
			},

			set value($$value) {
				$.set(valueUndefined, $$value, true);
			},
			helper,
			$$slots: { helper: true }
		});
	}

	var pre_1 = $.sibling(node_1, 2);
	var text_3 = $.only_child(pre_1);

	$.reset(div_2);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_text(text_1, `Value: ${$0 ?? ''}`);
			$.set_text(text_3, `Value: ${$1 ?? ''}`);
		},
		[
			() => JSON.stringify($.get(valueNull)),
			() => JSON.stringify($.get(valueUndefined))
		]
	);

	$.append($$anchor, div);
}