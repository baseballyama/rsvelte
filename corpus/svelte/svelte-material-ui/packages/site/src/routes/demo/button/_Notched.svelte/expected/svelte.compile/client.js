import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { Label, Icon } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <pre class="status"> </pre>`, 1);

export default function _Notched($$anchor) {
	let clicked = $.state(0);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.update(clicked),
		variant: 'raised',
		class: 'button-shaped-notch',
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
		class: 'button-shaped-notch',
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
		variant: 'unelevated',
		class: 'button-shaped-notch',
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

					var text_3 = $.text('Icon');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_2, 2);

	Button(node_5, {
		onclick: () => $.update(clicked),
		variant: 'unelevated',
		class: 'button-shaped-notch',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_6 = $.first_child(fragment_4);

			Label(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Trailing Icon');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Icon(node_7, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('favorite');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_5, 2);
	var text_6 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_6, `Clicked: ${$.get(clicked) ?? ''}`));
	$.append($$anchor, fragment);
}