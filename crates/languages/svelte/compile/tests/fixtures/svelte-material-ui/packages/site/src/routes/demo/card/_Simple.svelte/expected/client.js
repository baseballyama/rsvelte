import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card, { Content } from '@smui/card';

var root = $.from_html(`You can also use <code>Content</code>.`, 1);
var root_1 = $.from_html(`<div class="card-display"><div class="card-container"><!></div> <div class="card-container"><!></div> <div class="card-container"><!></div></div>`);

export default function _Simple($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Card(node, {
		padded: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('A simple padded card.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Card(node_1, {
		children: ($$anchor, $$slotProps) => {
			Content($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();

					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Card(node_2, {
		variant: 'outlined',
		padded: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('An outlined, padded card.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}