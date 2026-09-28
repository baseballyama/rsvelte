import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard, Input, InputAddon, Tooltip, ButtonGroup } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function InputGroup($$anchor) {
	let value = $.state("https://flowbite.com");

	ButtonGroup($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			InputAddon(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('URL');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Input(node_1, {
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

			var node_2 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, success = $.noop) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Tooltip(node_3, {
						class: 'whitespace-nowrap',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, success() ? "Copied" : "Copy to clipboard"));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent = ($$anchor) => {
							CheckOutline($$anchor, {});
						};

						var alternate = ($$anchor) => {
							ClipboardCleanSolid($$anchor, {});
						};

						$.if(node_4, ($$render) => {
							if (success()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				Clipboard(node_2, {
					color: 'primary',
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}