import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconButton, { Icon } from '@smui/icon-button';

var root = $.from_html(`<div style="display: flex; align-items: center;"><!></div> <div style="display: flex; align-items: center;"><!>&nbsp;(disabled)</div> <div style="display: flex; align-items: center;"><!>&nbsp;(no ripple)</div> <pre class="status"> </pre>`, 1);

export default function _Simple($$anchor) {
	let clicked = $.state(0);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	IconButton(node, {
		onclick: () => $.update(clicked),
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
		onclick: () => $.update(clicked),
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('search');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	IconButton(node_2, {
		onclick: () => $.update(clicked),
		ripple: false,
		children: ($$anchor, $$slotProps) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('add_shopping_cart');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(div_2);

	var pre = $.sibling(div_2, 2);
	var text_3 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_3, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}