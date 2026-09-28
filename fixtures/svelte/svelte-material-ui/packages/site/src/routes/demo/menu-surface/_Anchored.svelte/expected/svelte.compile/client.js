import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MenuSurface from '@smui/menu-surface';
import Textfield from '@smui/textfield';
import Button from '@smui/button';

var root = $.from_html(`<div style="margin: 1em; display: flex; flex-direction: column; align-items: flex-end;"><!> <!> <!></div>`);
var root_1 = $.from_html(`<div style="min-width: 100px;"><!> <!></div>`);

export default function _Anchored($$anchor) {
	let surface;
	let name = $.state('');
	let email = $.state('');
	var div = root_1();
	var node = $.child(div);

	Button(node, {
		onclick: () => surface.setOpen(true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open Menu Surface');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		MenuSurface(node_1, {
			anchorCorner: 'BOTTOM_LEFT',
			children: ($$anchor, $$slotProps) => {
				var div_1 = root();
				var node_2 = $.child(div_1);

				Textfield(node_2, {
					label: 'Name',
					get value() {
						return $.get(name);
					},

					set value($$value) {
						$.set(name, $$value, true);
					}
				});

				var node_3 = $.sibling(node_2, 2);

				Textfield(node_3, {
					label: 'Email',
					type: 'email',
					get value() {
						return $.get(email);
					},

					set value($$value) {
						$.set(email, $$value, true);
					}
				});

				var node_4 = $.sibling(node_3, 2);

				Button(node_4, {
					style: 'margin-top: 1em;',
					onclick: () => surface.setOpen(false),
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Submit');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			},
			$$slots: { default: true }
		}),
		($$value) => surface = $$value,
		() => surface
	);

	$.reset(div);
	$.append($$anchor, div);
}