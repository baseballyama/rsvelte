import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Clipboard, Tooltip } from "flowbite-svelte";
import { CheckOutline, ClipboardCleanSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Contact details</h2> <address class="relative grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-4 not-italic dark:border-gray-600 dark:bg-gray-700"><div class="hidden space-y-2 leading-loose text-gray-500 sm:block dark:text-gray-400">Name <br/> Email <br/> Phone Number</div> <div id="contact-details" class="space-y-2 leading-loose font-medium text-gray-900 dark:text-white">Bonnie Green <br/> name@flowbite.com <br/> + 12 345 67890</div></address> <!>`, 1);

export default function Contact($$anchor) {
	let value = $.state("");

	function onclick(ev) {
		const target = ev.target;
		const codeBlock = target.ownerDocument.querySelector("#contact-details");

		if (codeBlock) {
			$.set(value, codeBlock.textContent || "", true);
		}
	}

	Card($$anchor, {
		class: 'relative p-5',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.sibling($.first_child(fragment_1), 4);

			{
				const children = ($$anchor, success = $.noop) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

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

					$.append($$anchor, fragment_2);
				};

				Clipboard(node, {
					onclick,
					embedded: true,
					class: 'absolute end-2 top-2 h-8 px-2.5 font-medium focus:ring-0',
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