import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import HelperText from '@smui/textfield/helper-text';

var root = $.from_html(`<div class="columns margins"><div><!></div> <div><!></div> <div><!></div></div>`);

export default function _Disabled($$anchor) {
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
			disabled: true,
			value: '',
			label: 'Standard',
			helper,
			$$slots: { helper: true }
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		const helper = ($$anchor) => {
			HelperText($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Helper Text');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		Textfield(node_1, {
			variant: 'filled',
			disabled: true,
			value: '',
			label: 'Filled',
			helper,
			$$slots: { helper: true }
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

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

		Textfield(node_2, {
			variant: 'outlined',
			disabled: true,
			value: '',
			label: 'Outlined',
			helper,
			$$slots: { helper: true }
		});
	}

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}