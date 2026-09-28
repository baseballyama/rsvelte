import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label, Icon } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <pre class="status"> </pre>`, 1);

export default function _Round($$anchor) {
	let clicked = $.state(0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.update(clicked),
		variant: 'raised',
		class: 'button-shaped-round',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Raised');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => $.update(clicked),
		variant: 'unelevated',
		class: 'button-shaped-round',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Unelevated');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => $.update(clicked),
		variant: 'outlined',
		class: 'button-shaped-round',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Outlined');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: () => $.update(clicked),
		variant: 'unelevated',
		class: 'button-shaped-round',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_4 = $.first_child(fragment_4);

			Icon(node_4, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('favorite');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Label(node_5, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Icon');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Button(node_6, {
		onclick: () => $.update(clicked),
		variant: 'outlined',
		class: 'button-shaped-round',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_7 = $.first_child(fragment_5);

			Label(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Trailing Icon');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Icon(node_8, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('favorite');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_6, 2);
	var text_7 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_7, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}