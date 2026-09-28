import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Clipboard, Input, Tooltip } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="w-64"><!></div>`);

export default function Input_1($$anchor) {
	let value = $.state("npm install flowbite");
	var div = root_1();
	var node = $.child(div);

	{
		const right = ($$anchor) => {
			{
				const children = ($$anchor, success = $.noop) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Tooltip(node_1, {
						get isOpen() {
							return success();
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, success() ? "Copied" : "Copy to clipboard"));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					{
						var consequent = ($$anchor) => {
							CheckOutline($$anchor, {});
						};

						var alternate = ($$anchor) => {
							ClipboardCleanSolid($$anchor, {});
						};

						$.if(node_2, ($$render) => {
							if (success()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				};

				Clipboard($$anchor, {
					embedded: true,
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
		};

		Input(node, {
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},
			right,
			$$slots: { right: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}