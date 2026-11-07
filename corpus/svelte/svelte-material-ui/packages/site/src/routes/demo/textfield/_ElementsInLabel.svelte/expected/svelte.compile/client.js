import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Textfield from '@smui/textfield';
import { Icon as CommonIcon } from '@smui/common';

var root = $.from_html(`<!> Email`, 1);
var root_1 = $.from_html(`<div class="margins"><!></div>`);

export default function _ElementsInLabel($$anchor) {
	let valueElementsLabel = $.state('');
	var div = root_1();
	var node = $.child(div);

	{
		const label = ($$anchor) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			CommonIcon(node_1, {
				class: 'material-icons',
				style: 'font-size: 1em; line-height: normal; vertical-align: top;',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('email');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next();
			$.append($$anchor, fragment);
		};

		Textfield(node, {
			type: 'email',
			get value() {
				return $.get(valueElementsLabel);
			},

			set value($$value) {
				$.set(valueElementsLabel, $$value, true);
			},
			label,
			$$slots: { label: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}