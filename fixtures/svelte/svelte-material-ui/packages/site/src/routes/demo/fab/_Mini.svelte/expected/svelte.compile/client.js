import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fab, { Icon } from '@smui/fab';

var root = $.from_html(`<div class="flexy"><div class="margins"><!></div> <div class="margins"><!></div></div> <pre class="status"> </pre>`, 1);

export default function _Mini($$anchor) {
	let clicked = $.state(0);
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Fab(node, {
		onclick: () => $.update(clicked),
		mini: true,
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
		color: 'primary',
		onclick: () => $.update(clicked),
		mini: true,
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('favorite');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_2 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_2, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}