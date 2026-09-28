import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '@smui-extra/badge';
import Button, { Label } from '@smui/button';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import { Icon } from '@smui/common';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><span style="position: relative;">Text with a badge. <!></span></div> <div style="margin-top: 2em;"><!></div> <div style="margin-top: 1.5em;">Icon button with a badge. <!></div> <div style="margin-top: 1.5em;">FAB with a badge. <!></div> <div style="margin-top: 1.5em;"><span style="position: relative; display: inline-block; padding: .5em .5em 0 0;">Long content in a badge. <!></span></div> <div style="margin-top: 1.5em;"><span style="position: relative;">No content in a badge. <!></span></div>`, 1);

export default function _Simple($$anchor) {
	var fragment = root_1();
	var div = $.first_child(fragment);
	var span = $.child(div);
	var node = $.sibling($.child(span));

	Badge(node, {
		'aria-label': 'unread count',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('3');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(span);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Button(node_1, {
		style: 'position: relative;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Label(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Button with a Badge');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Badge(node_3, {
				'aria-label': 'new messages count',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('7');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.sibling($.child(div_2));

	IconButton(node_4, {
		style: 'position: relative;',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			Icon(node_5, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('message');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Badge(node_6, {
				'aria-label': 'unread content count',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('2');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_7 = $.sibling($.child(div_3));

	Fab(node_7, {
		style: 'position: relative;',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_8 = $.first_child(fragment_3);

			Icon(node_8, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('message');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Badge(node_9, {
				'aria-label': 'unread content count',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('2');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var span_1 = $.child(div_4);
	var node_10 = $.sibling($.child(span_1));

	Badge(node_10, {
		'aria-label': 'notification count',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('1,000,000');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.reset(span_1);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var span_2 = $.child(div_5);
	var node_11 = $.sibling($.child(span_2));

	Badge(node_11, {
		'aria-label': 'unread content is available',
		style: 'min-height: 10px; min-width: 10px; padding: 0;'
	});

	$.reset(span_2);
	$.reset(div_5);
	$.append($$anchor, fragment);
}