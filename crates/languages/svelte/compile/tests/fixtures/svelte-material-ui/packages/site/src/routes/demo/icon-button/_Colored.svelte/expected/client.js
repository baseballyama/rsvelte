import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_html(`<div style="display: flex; align-items: center;"><!></div> <div style="display: flex; align-items: center;"><!></div>`, 1);

export default function _Colored($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	IconButton(node, {
		class: 'my-colored-icon-button',
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('build');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	IconButton(node_1, {
		class: 'my-colored-icon-button',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('build');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}