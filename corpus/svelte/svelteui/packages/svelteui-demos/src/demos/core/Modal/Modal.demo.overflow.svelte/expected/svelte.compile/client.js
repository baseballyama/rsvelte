import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal, Group, Button } from '@svelteuidev/core';

const code = `
// (default) - overflow is handled by modal wrapper
<Modal overflow="outside" />

// overflow is handled by modal body
<Modal overflow="inside" />
`;

export const type = 'demo';
export const configuration = { code };

const content = Array(100).fill(0).map((_, index) => 'Svelte is a complier');
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Modal_demo_overflow($$anchor, $$props) {
	$.push($$props, true);

	let insideOpened = false;
	let outsideOpened = false;
	const closeInside = () => insideOpened = false;
	const closeOutside = () => outsideOpened = false;
	const openInside = () => insideOpened = true;
	const openOutside = () => outsideOpened = true;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Modal(node, {
		get opened() {
			return outsideOpened;
		},
		title: 'Please consider this',
		overflow: 'outside',
		$$events: { close: closeOutside },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => content, $.index, ($$anchor, _) => {
				var p = root();
				var text = $.only_child(p, true);

				$.template_effect(() => $.set_text(text, $.get(_)));
				$.append($$anchor, p);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Modal(node_2, {
		get opened() {
			return insideOpened;
		},
		title: 'Please consider this',
		overflow: 'inside',
		$$events: { close: closeInside },
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.each(node_3, 17, () => content, $.index, ($$anchor, _) => {
				var p_1 = root();
				var text_1 = $.only_child(p_1, true);

				$.template_effect(() => $.set_text(text_1, $.get(_)));
				$.append($$anchor, p_1);
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Group(node_4, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_5 = $.first_child(fragment_3);

			Button(node_5, {
				color: 'pink',
				$$events: { click: openOutside },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Outside overflow');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				color: 'cyan',
				$$events: { click: openInside },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Inside overflow');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}