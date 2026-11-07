import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Paper, { Title, Content } from '@smui/paper';

var root = $.from_html(
	`By adding the <code>square</code> property, the paper gains sharper corners
      and can be used to intimidate foes.`,
	1
);

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="paper-container"><!> <!> <!></div>`);

export default function _Square($$anchor) {
	var div = root_2();
	var node = $.child(div);

	Paper(node, {
		square: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			Title(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Square Paper');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();

					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Paper(node_3, {
		square: true,
		variant: 'unelevated',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_4 = $.first_child(fragment_2);

			Title(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Unelevated Square Paper');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Content(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Unelevated square paper is pretty much a sheet of paper embedded in the\n      floor.');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Paper(node_6, {
		square: true,
		variant: 'outlined',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_7 = $.first_child(fragment_3);

			Title(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Outlined Square Paper');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Content(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Outlined square paper... is it really paper anymore?');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}