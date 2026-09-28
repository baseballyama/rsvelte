import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text';

var root = $.from_html(`<div class="margins"><!></div>`);

export default function _FullWidth($$anchor) {
	let value = $.state('');
	var div = root();
	var node = $.child(div);

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
			style: 'width: 100%;',
			helperLine$style: 'width: 100%;',
			label: 'Label',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			helper,
			$$slots: { helper: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}