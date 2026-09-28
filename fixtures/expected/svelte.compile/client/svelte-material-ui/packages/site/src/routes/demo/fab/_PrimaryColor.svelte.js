import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fab, { Icon } from '@smui/fab';

var root = $.from_html(`<div class="flexy"><div class="margins"><!></div></div> <pre class="status"> </pre>`, 1);

export default function _PrimaryColor($$anchor) {
	let clicked = $.state(0);
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Fab(node, {
		color: 'primary',
		onclick: () => $.update(clicked),
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
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_1, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}