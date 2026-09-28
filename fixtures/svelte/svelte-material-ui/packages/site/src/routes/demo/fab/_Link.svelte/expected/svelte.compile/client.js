import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fab, { Label, Icon } from '@smui/fab';

var root = $.from_html(`<div class="flexy"><div class="margins"><!></div> <div class="margins"><!></div> <div class="margins"><!></div> <div class="margins"><!></div></div> <pre class="status"> </pre>`, 1);

export default function _Link($$anchor) {
	let clicked = $.state(0);
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Fab(node, {
		onclick: () => $.update(clicked),
		href: 'http://example.com',
		target: '_blank',
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
		href: 'http://example.com',
		target: '_blank',
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

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Fab(node_2, {
		onclick: () => $.update(clicked),
		href: 'http://example.com',
		target: '_blank',
		extended: true,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Link');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.child(div_4);

	Fab(node_3, {
		color: 'primary',
		onclick: () => $.update(clicked),
		href: 'http://example.com',
		target: '_blank',
		extended: true,
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Link');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_4 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_4, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}