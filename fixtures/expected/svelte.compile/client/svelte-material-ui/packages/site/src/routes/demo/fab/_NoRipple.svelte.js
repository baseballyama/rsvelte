import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fab, { Label, Icon } from '@smui/fab';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flexy"><div class="margins"><!></div> <div class="margins"><!></div> <div class="margins"><!></div> <div class="margins"><!></div></div> <pre class="status"> </pre>`, 1);

export default function _NoRipple($$anchor) {
	let clicked = $.state(0);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Fab(node, {
		onclick: () => $.update(clicked),
		ripple: false,
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
		ripple: false,
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
		extended: true,
		ripple: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_3 = $.first_child(fragment_3);

			Icon(node_3, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('favorite');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Label(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Extended');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_5 = $.child(div_4);

	Fab(node_5, {
		color: 'primary',
		onclick: () => $.update(clicked),
		extended: true,
		ripple: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_6 = $.first_child(fragment_4);

			Icon(node_6, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('favorite');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Label(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Extended');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_6 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_6, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}