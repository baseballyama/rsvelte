import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '@smui-extra/badge';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div style="margin-top: 2em;"><!></div>`);

export default function _Square($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Button(node, {
		style: 'position: relative;',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Label(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Square Badge');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Badge(node_2, {
				square: true,
				'aria-label': 'unread count',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('5');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}