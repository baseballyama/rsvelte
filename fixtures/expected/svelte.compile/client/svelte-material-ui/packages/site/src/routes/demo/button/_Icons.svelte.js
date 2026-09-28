import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label, Icon } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <pre class="status"> </pre>`, 1);

export default function _Icons($$anchor) {
	let clicked = $.state(0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.update(clicked),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Icon(node_1, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('favorite');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Label(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Leading Icon');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Button(node_3, {
		onclick: () => $.update(clicked),
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			Label(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Trailing Icon');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Icon(node_5, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('favorite');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Button(node_6, {
		color: 'secondary',
		onclick: () => $.update(clicked),
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_7 = $.first_child(fragment_3);

			Icon(node_7, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('favorite');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Label(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Leading Icon');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_6, 2);

	Button(node_9, {
		color: 'secondary',
		onclick: () => $.update(clicked),
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_10 = $.first_child(fragment_4);

			Label(node_10, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Trailing Icon');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Icon(node_11, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('favorite');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_9, 2);
	var text_8 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_8, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}