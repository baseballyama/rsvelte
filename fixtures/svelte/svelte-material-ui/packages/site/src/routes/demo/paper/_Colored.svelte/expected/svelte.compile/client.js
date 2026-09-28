import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Paper, { Title, Content } from '@smui/paper';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="paper-container"><!> <!> <!> <!></div>`);

export default function _Colored($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Paper(node, {
		color: 'custom-green',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Title(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Custom Color Paper');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Content(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Paper can have a color, allowing you to construct fancy school projects\n      with the colored paper and glue sticks.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Paper(node_3, {
		color: 'custom-green',
		variant: 'unelevated',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_4 = $.first_child(fragment_1);

			Title(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Unelevated Custom Color Paper');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Content(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Unelevated custom color paper is nice because it will pretty much always\n      stand out, even in light mode.');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Paper(node_6, {
		color: 'custom-green',
		variant: 'outlined',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_7 = $.first_child(fragment_2);

			Title(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Outlined Custom Color Paper');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Content(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Outlined custom color paper has a neat border.');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_6, 2);

	Paper(node_9, {
		color: 'custom-green',
		variant: 'outlined',
		class: 'custom-green',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_10 = $.first_child(fragment_3);

			Title(node_10, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Outlined Custom Color Paper with Custom Color Text');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Content(node_11, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Outlined custom color paper with custom color color text. For the times\n      when you need to draw attention.');

					$.append($$anchor, text_7);
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