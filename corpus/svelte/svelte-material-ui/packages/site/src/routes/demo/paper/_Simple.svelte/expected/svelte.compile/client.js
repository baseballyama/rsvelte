import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Paper, { Title, Subtitle, Content } from '@smui/paper';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="paper-container"><!> <!> <!></div>`);

export default function _Simple($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Paper(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Title(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Paper');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Subtitle(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('This is a sheet of paper.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Content(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Paper is used to build an elevated surface.');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Paper(node_4, {
		variant: 'unelevated',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_5 = $.first_child(fragment_1);

			Title(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Unelevated Paper');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Subtitle(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('This is an unelevated sheet of paper.');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Content(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Unelevated paper is used to build a surface.');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 2);

	Paper(node_8, {
		variant: 'outlined',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_9 = $.first_child(fragment_2);

			Title(node_9, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Outlined Paper');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Subtitle(node_10, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('This is an outlined sheet of paper.');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Content(node_11, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Outlined paper is used to build a container.');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}