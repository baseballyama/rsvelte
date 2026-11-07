import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Label, Input, Checkbox } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span>Email:</span> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Focus($$anchor) {
	let open = $.state(false);
	let checked = $.state(false);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, {
		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Focus trap');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const footer = ($$anchor) => {
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			Button(node_3, {
				type: 'submit',
				value: 'notify',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Notify');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				type: 'submit',
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Cancel');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Modal(node_2, {
			form: true,
			get focustrap() {
				return $.get(checked);
			},
			size: 'sm',
			title: 'Notify user',
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},
			footer,
			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					class: 'space-y-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_5 = $.sibling($.first_child(fragment_3), 2);

						Input(node_5, { autofocus: true });
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { footer: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}