import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fab, { Label, Icon } from '@smui/fab';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flexy"><div class="margins"><!></div> <div class="margins"><!></div></div>`);

export default function _Colored($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Fab(node, {
		class: 'my-colored-fab',
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('favorite');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Fab(node_1, {
		class: 'my-colored-fab',
		extended: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Icon(node_2, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('favorite');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Label(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Extended');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}