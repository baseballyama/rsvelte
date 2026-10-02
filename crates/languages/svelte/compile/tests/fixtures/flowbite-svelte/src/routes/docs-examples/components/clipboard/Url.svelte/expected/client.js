import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Clipboard,
	Input,
	Label,
	Helper,
	Button,
	Tooltip,
	ButtonGroup
} from "flowbite-svelte";

import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-2"><!> <!> <!></div>`);

export default function Url($$anchor) {
	let value = $.state("https://bit.ly/3U2SXcF");
	var div = root_2();
	var node = $.child(div);

	Label(node, {
		for: 'url-shortener',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Shorten URL:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ButtonGroup(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_2 = $.first_child(fragment);

			Button(node_2, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Generate');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, {
				id: 'url-shortener',
				readonly: true,
				disabled: true,
				class: 'w-64',
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			{
				const children = ($$anchor, success = $.noop) => {
					var fragment_1 = root();
					var node_5 = $.first_child(fragment_1);

					Tooltip(node_5, {
						class: 'whitespace-nowrap',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, success() ? "Copied" : "Copy link"));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					{
						var consequent = ($$anchor) => {
							CheckOutline($$anchor, {});
						};

						var alternate = ($$anchor) => {
							ClipboardCleanSolid($$anchor, {});
						};

						$.if(node_6, ($$render) => {
							if (success()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				};

				Clipboard(node_4, {
					get value() {
						return $.get(value);
					},

					set value($$value) {
						$.set(value, $$value, true);
					},
					children,
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_1, 2);

	Helper(node_7, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Make sure that your URL is valid');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}