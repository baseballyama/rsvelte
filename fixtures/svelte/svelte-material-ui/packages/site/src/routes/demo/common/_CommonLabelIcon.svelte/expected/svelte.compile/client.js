import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '@smui/button';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import { Icon, Label } from '@smui/common';

var root = $.from_html(`<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1em;"><!> <!> <!> <!></div>`);

export default function _CommonLabelIcon($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Button with a Label');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Fab(node_1, {
		extended: true,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Fab with a Label');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	IconButton(node_2, {
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('favorite');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Fab(node_3, {
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('favorite');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}